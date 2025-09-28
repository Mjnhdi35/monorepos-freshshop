import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    private redisService: RedisService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    sellerId: string,
  ): Promise<Product> {
    // Check if SKU already exists
    const existingProduct = await this.productsRepository.findOne({
      where: { sku: createProductDto.sku },
    });

    if (existingProduct) {
      throw new ConflictException('Product with this SKU already exists');
    }

    // Verify category exists
    const category = await this.categoriesRepository.findOne({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Create product
    const product = this.productsRepository.create({
      ...createProductDto,
      sellerId,
    });

    const savedProduct = await this.productsRepository.save(product);

    // Cache product data
    await this.redisService.set(
      `product:${savedProduct.id}`,
      JSON.stringify(savedProduct),
      3600, // 1 hour
    );

    // Invalidate products list cache
    await this.redisService.del('products:all');

    // Publish product created event
    await this.redisService.publish(
      'product:created',
      JSON.stringify({
        productId: savedProduct.id,
        name: savedProduct.name,
        price: savedProduct.price,
        sellerId: savedProduct.sellerId,
      }),
    );

    return savedProduct;
  }

  async findAll(): Promise<Product[]> {
    const cacheKey = 'products:all';
    const cachedProducts = await this.redisService.get(cacheKey);

    if (cachedProducts) {
      return JSON.parse(cachedProducts);
    }

    const products = await this.productsRepository.find({
      relations: ['seller', 'category'],
      where: { isActive: true },
    });

    // Cache for 5 minutes
    await this.redisService.set(cacheKey, JSON.stringify(products), 300);

    return products;
  }

  async findOne(id: string): Promise<Product> {
    const cacheKey = `product:${id}`;
    const cachedProduct = await this.redisService.get(cacheKey);

    if (cachedProduct) {
      return JSON.parse(cachedProduct);
    }

    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['seller', 'category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Cache for 1 hour
    await this.redisService.set(cacheKey, JSON.stringify(product), 3600);

    return product;
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    const cacheKey = `products:category:${categoryId}`;
    const cachedProducts = await this.redisService.get(cacheKey);

    if (cachedProducts) {
      return JSON.parse(cachedProducts);
    }

    const products = await this.productsRepository.find({
      where: { categoryId, isActive: true },
      relations: ['seller', 'category'],
    });

    // Cache for 5 minutes
    await this.redisService.set(cacheKey, JSON.stringify(products), 300);

    return products;
  }

  async findBySeller(sellerId: string): Promise<Product[]> {
    const cacheKey = `products:seller:${sellerId}`;
    const cachedProducts = await this.redisService.get(cacheKey);

    if (cachedProducts) {
      return JSON.parse(cachedProducts);
    }

    const products = await this.productsRepository.find({
      where: { sellerId, isActive: true },
      relations: ['category'],
    });

    // Cache for 5 minutes
    await this.redisService.set(cacheKey, JSON.stringify(products), 300);

    return products;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);

    // If SKU is being updated, check for conflicts
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingProduct = await this.productsRepository.findOne({
        where: { sku: updateProductDto.sku },
      });

      if (existingProduct) {
        throw new ConflictException('Product with this SKU already exists');
      }
    }

    // If category is being updated, verify it exists
    if (updateProductDto.categoryId) {
      const category = await this.categoriesRepository.findOne({
        where: { id: updateProductDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    Object.assign(product, updateProductDto);
    const updatedProduct = await this.productsRepository.save(product);

    // Update cache
    await this.redisService.set(
      `product:${id}`,
      JSON.stringify(updatedProduct),
      3600,
    );

    // Invalidate related caches
    await this.redisService.del('products:all');
    await this.redisService.del(
      `products:category:${updatedProduct.categoryId}`,
    );
    await this.redisService.del(`products:seller:${updatedProduct.sellerId}`);

    // Publish product updated event
    await this.redisService.publish(
      'product:updated',
      JSON.stringify({
        productId: updatedProduct.id,
        name: updatedProduct.name,
        price: updatedProduct.price,
        sellerId: updatedProduct.sellerId,
      }),
    );

    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);

    // Remove from cache
    await this.redisService.del(`product:${id}`);
    await this.redisService.del('products:all');
    await this.redisService.del(`products:category:${product.categoryId}`);
    await this.redisService.del(`products:seller:${product.sellerId}`);

    // Publish product deleted event
    await this.redisService.publish(
      'product:deleted',
      JSON.stringify({
        productId: id,
      }),
    );
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id);

    if (product.stock + quantity < 0) {
      throw new ConflictException('Insufficient stock');
    }

    product.stock += quantity;
    const updatedProduct = await this.productsRepository.save(product);

    // Update cache
    await this.redisService.set(
      `product:${id}`,
      JSON.stringify(updatedProduct),
      3600,
    );

    // Publish stock updated event
    await this.redisService.publish(
      'product:stock_updated',
      JSON.stringify({
        productId: updatedProduct.id,
        newStock: updatedProduct.stock,
        change: quantity,
      }),
    );

    return updatedProduct;
  }
}

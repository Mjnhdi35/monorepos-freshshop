import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Category } from './category.entity';

@Entity('products')
export class Product {
  @ApiProperty({ description: 'Product ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Product name' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Product description' })
  @Column('text')
  description: string;

  @ApiProperty({ description: 'Product price' })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ description: 'Product stock quantity' })
  @Column({ default: 0 })
  stock: number;

  @ApiProperty({ description: 'Product image URL' })
  @Column({ nullable: true })
  imageUrl?: string;

  @ApiProperty({ description: 'Product SKU' })
  @Column({ unique: true })
  sku: string;

  @ApiProperty({ description: 'Product weight in grams' })
  @Column({ nullable: true })
  weight?: number;

  @ApiProperty({ description: 'Product dimensions' })
  @Column({ nullable: true })
  dimensions?: string;

  @ApiProperty({ description: 'Product is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Product is featured' })
  @Column({ default: false })
  isFeatured: boolean;

  @ApiProperty({ description: 'Product creation date' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Product last update date' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'Product seller ID' })
  @Column('uuid')
  sellerId: string;

  @ApiProperty({ description: 'Product category ID' })
  @Column('uuid')
  categoryId: string;

  @ManyToOne(() => User, (user) => user.products)
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;
}

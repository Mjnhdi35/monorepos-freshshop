import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Fresh Organic Tomatoes',
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Fresh organic tomatoes from local farm',
  })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ description: 'Product price', example: 5.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Product stock quantity', example: 100 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: 'Product SKU', example: 'TOM-001' })
  @IsString()
  sku: string;

  @ApiProperty({
    description: 'Product weight in grams',
    example: 500,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiProperty({
    description: 'Product dimensions',
    example: '10x10x5 cm',
    required: false,
  })
  @IsOptional()
  @IsString()
  dimensions?: string;

  @ApiProperty({
    description: 'Product is featured',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ description: 'Product category ID', example: 'uuid-string' })
  @IsUUID()
  categoryId: string;
}

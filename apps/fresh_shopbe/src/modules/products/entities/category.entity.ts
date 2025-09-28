import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from './product.entity';

@Entity('categories')
export class Category {
  @ApiProperty({ description: 'Category ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Category name' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'Category description' })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({ description: 'Category image URL' })
  @Column({ nullable: true })
  imageUrl?: string;

  @ApiProperty({ description: 'Category is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Category creation date' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Category last update date' })
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}

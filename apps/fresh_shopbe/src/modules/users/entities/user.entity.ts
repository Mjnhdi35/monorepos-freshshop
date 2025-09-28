import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/entities/product.entity';
import { Role } from '../../auth/entities/role.entity';

@Entity('users')
export class User {
  @ApiProperty({ description: 'User ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User email' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'User username' })
  @Column({ unique: true })
  username: string;

  @ApiProperty({ description: 'User first name' })
  @Column()
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  @Column()
  lastName: string;

  @Exclude()
  @Column()
  password: string;

  @ApiProperty({ description: 'User phone number' })
  @Column({ nullable: true })
  phone?: string;

  @ApiProperty({ description: 'User address' })
  @Column({ nullable: true })
  address?: string;

  @ApiProperty({ description: 'User role ID' })
  @Column('uuid')
  roleId: string;

  @ApiProperty({ description: 'User is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'User creation date' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'User last update date' })
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Product, (product) => product.seller)
  products: Product[];

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

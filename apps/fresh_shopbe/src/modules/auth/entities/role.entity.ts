import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Permission } from './permission.entity';
import { User } from '../../users/entities/user.entity';

@Entity('roles')
export class Role {
  @ApiProperty({ description: 'Role ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Role name' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'Role description' })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({ description: 'Role is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Role is system role (cannot be deleted)' })
  @Column({ default: false })
  isSystem: boolean;

  @ApiProperty({ description: 'Role creation date' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Role last update date' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Permission, (permission) => permission.roles, {
    eager: true,
  })
  permissions: Permission[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}

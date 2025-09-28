import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission {
  @ApiProperty({ description: 'Permission ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Permission name' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'Permission description' })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({ description: 'Permission resource (e.g., users, products)' })
  @Column()
  resource: string;

  @ApiProperty({
    description: 'Permission action (e.g., create, read, update, delete)',
  })
  @Column()
  action: string;

  @ApiProperty({ description: 'Permission is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Permission creation date' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Permission last update date' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Role, (role) => role.permissions)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'permissionId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: Role[];
}

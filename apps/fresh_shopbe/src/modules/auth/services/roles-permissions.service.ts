import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class RolesPermissionsService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
  ) {}

  async onModuleInit() {
    await this.initializeRolesAndPermissions();
  }

  private async initializeRolesAndPermissions() {
    // Create permissions first
    const permissions = await this.createPermissions();

    // Create roles and assign permissions
    await this.createRoles(permissions);
  }

  private async createPermissions(): Promise<Permission[]> {
    const permissionData = [
      // User permissions
      {
        name: 'users:create',
        description: 'Create users',
        resource: 'users',
        action: 'create',
      },
      {
        name: 'users:read',
        description: 'Read users',
        resource: 'users',
        action: 'read',
      },
      {
        name: 'users:update',
        description: 'Update users',
        resource: 'users',
        action: 'update',
      },
      {
        name: 'users:delete',
        description: 'Delete users',
        resource: 'users',
        action: 'delete',
      },

      // Product permissions
      {
        name: 'products:create',
        description: 'Create products',
        resource: 'products',
        action: 'create',
      },
      {
        name: 'products:read',
        description: 'Read products',
        resource: 'products',
        action: 'read',
      },
      {
        name: 'products:update',
        description: 'Update products',
        resource: 'products',
        action: 'update',
      },
      {
        name: 'products:delete',
        description: 'Delete products',
        resource: 'products',
        action: 'delete',
      },
      {
        name: 'products:manage_stock',
        description: 'Manage product stock',
        resource: 'products',
        action: 'manage_stock',
      },

      // Category permissions
      {
        name: 'categories:create',
        description: 'Create categories',
        resource: 'categories',
        action: 'create',
      },
      {
        name: 'categories:read',
        description: 'Read categories',
        resource: 'categories',
        action: 'read',
      },
      {
        name: 'categories:update',
        description: 'Update categories',
        resource: 'categories',
        action: 'update',
      },
      {
        name: 'categories:delete',
        description: 'Delete categories',
        resource: 'categories',
        action: 'delete',
      },

      // Role permissions
      {
        name: 'roles:create',
        description: 'Create roles',
        resource: 'roles',
        action: 'create',
      },
      {
        name: 'roles:read',
        description: 'Read roles',
        resource: 'roles',
        action: 'read',
      },
      {
        name: 'roles:update',
        description: 'Update roles',
        resource: 'roles',
        action: 'update',
      },
      {
        name: 'roles:delete',
        description: 'Delete roles',
        resource: 'roles',
        action: 'delete',
      },

      // System permissions
      {
        name: 'system:admin',
        description: 'Full system access',
        resource: 'system',
        action: 'admin',
      },
    ];

    const permissions: Permission[] = [];

    for (const permData of permissionData) {
      let permission = await this.permissionsRepository.findOne({
        where: { name: permData.name },
      });

      if (!permission) {
        permission = this.permissionsRepository.create(permData);
        permission = await this.permissionsRepository.save(permission);
      }

      permissions.push(permission);
    }

    return permissions;
  }

  private async createRoles(permissions: Permission[]): Promise<void> {
    const roleData = [
      {
        name: 'super_admin',
        description: 'Super Administrator with full system access',
        isSystem: true,
        permissions: permissions.map((p) => p.name), // All permissions
      },
      {
        name: 'admin',
        description: 'Administrator with management access',
        isSystem: true,
        permissions: [
          'users:create',
          'users:read',
          'users:update',
          'users:delete',
          'products:create',
          'products:read',
          'products:update',
          'products:delete',
          'products:manage_stock',
          'categories:create',
          'categories:read',
          'categories:update',
          'categories:delete',
          'roles:read',
        ],
      },
      {
        name: 'seller',
        description: 'Product seller with product management access',
        isSystem: true,
        permissions: [
          'products:create',
          'products:read',
          'products:update',
          'products:manage_stock',
          'categories:read',
        ],
      },
      {
        name: 'user',
        description: 'Regular user with basic access',
        isSystem: true,
        permissions: ['products:read', 'categories:read'],
      },
    ];

    for (const roleInfo of roleData) {
      let role = await this.rolesRepository.findOne({
        where: { name: roleInfo.name },
        relations: ['permissions'],
      });

      const rolePermissions = permissions.filter((p) =>
        roleInfo.permissions.includes(p.name),
      );

      if (!role) {
        role = this.rolesRepository.create({
          name: roleInfo.name,
          description: roleInfo.description,
          isSystem: roleInfo.isSystem,
          permissions: rolePermissions,
        });
        role = await this.rolesRepository.save(role);
      } else {
        // Ensure permissions are up-to-date if seed changes
        role.permissions = rolePermissions;
        await this.rolesRepository.save(role);
      }
    }
  }

  async getUserRole(userId: string): Promise<Role | null> {
    return this.rolesRepository.findOne({
      where: { users: { id: userId } },
      relations: ['permissions'],
    });
  }

  async getRoleByName(name: string): Promise<Role | null> {
    return this.rolesRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });
  }

  async getAllRoles(): Promise<Role[]> {
    return this.rolesRepository.find({
      relations: ['permissions'],
    });
  }

  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionsRepository.find();
  }
}

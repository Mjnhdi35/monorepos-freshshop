import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RolesPermissionsService } from '../services/roles-permissions.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Roles } from '../decorators/roles.decorator';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';

@ApiTags('Roles & Permissions')
@Controller('roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(
    private readonly rolesPermissionsService: RolesPermissionsService,
  ) {}

  @Get()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin', 'super_admin')
  @RequirePermissions('roles:read')
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'List of roles', type: [Role] })
  async getAllRoles(): Promise<Role[]> {
    return this.rolesPermissionsService.getAllRoles();
  }

  @Get('permissions')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin', 'super_admin')
  @RequirePermissions('roles:read')
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({
    status: 200,
    description: 'List of permissions',
    type: [Permission],
  })
  async getAllPermissions(): Promise<Permission[]> {
    return this.rolesPermissionsService.getAllPermissions();
  }
}

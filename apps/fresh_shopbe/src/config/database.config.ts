import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Product } from '../modules/products/entities/product.entity';
import { Category } from '../modules/products/entities/category.entity';
import { Role } from '../modules/auth/entities/role.entity';
import { Permission } from '../modules/auth/entities/permission.entity';

export class DatabaseConfig {
  static getConfig(configService: ConfigService): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: configService.getOrThrow<string>('DB_HOST'),
      port: configService.getOrThrow<number>('DB_PORT'),
      username: configService.getOrThrow<string>('DB_USERNAME'),
      password: configService.getOrThrow<string>('DB_PASSWORD'),
      database: configService.getOrThrow<string>('DB_DATABASE'),
      entities: [User, Product, Category, Role, Permission],
      synchronize:
        configService.getOrThrow<string>('NODE_ENV') === 'development',
      logging: configService.getOrThrow<string>('NODE_ENV') === 'development',
      migrations: ['dist/migrations/*.js'],
      migrationsRun: true,
      ssl:
        configService.getOrThrow<string>('NODE_ENV') === 'production'
          ? { rejectUnauthorized: false }
          : false,
    };
  }
}

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private redisService: RedisService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username },
      ],
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this email or username already exists',
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);

    // Cache user data
    await this.redisService.set(
      `user:${savedUser.id}`,
      JSON.stringify(savedUser),
      3600, // 1 hour
    );

    // Publish user created event
    await this.redisService.publish(
      'user:created',
      JSON.stringify({
        userId: savedUser.id,
        email: savedUser.email,
        username: savedUser.username,
      }),
    );

    return savedUser;
  }

  async findAll(): Promise<User[]> {
    const cacheKey = 'users:all';
    const cachedUsers = await this.redisService.get(cacheKey);

    if (cachedUsers) {
      return JSON.parse(cachedUsers);
    }

    const users = await this.usersRepository.find({
      select: [
        'id',
        'email',
        'username',
        'firstName',
        'lastName',
        'phone',
        'address',
        'role',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });
    console.log('users', users);
    // Cache for 5 minutes
    await this.redisService.set(cacheKey, JSON.stringify(users), 300);

    return users;
  }

  async findOne(id: string): Promise<User> {
    const cacheKey = `user:${id}`;
    const cachedUser = await this.redisService.get(cacheKey);

    if (cachedUser) {
      return JSON.parse(cachedUser);
    }

    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role', 'role.permissions'],
      select: [
        'id',
        'email',
        'username',
        'firstName',
        'lastName',
        'phone',
        'address',
        'roleId',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Cache for 1 hour
    await this.redisService.set(cacheKey, JSON.stringify(user), 3600);

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);

    // Update cache
    await this.redisService.set(
      `user:${id}`,
      JSON.stringify(updatedUser),
      3600,
    );

    // Invalidate users list cache
    await this.redisService.del('users:all');

    // Publish user updated event
    await this.redisService.publish(
      'user:updated',
      JSON.stringify({
        userId: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
      }),
    );

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);

    // Remove from cache
    await this.redisService.del(`user:${id}`);
    await this.redisService.del('users:all');

    // Publish user deleted event
    await this.redisService.publish(
      'user:deleted',
      JSON.stringify({
        userId: id,
      }),
    );
  }
}

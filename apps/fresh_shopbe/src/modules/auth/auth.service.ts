import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';
import { SessionService } from './services/session.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { RolesPermissionsService } from './services/roles-permissions.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private sessionService: SessionService,
    private refreshTokenService: RefreshTokenService,
    private rolesPermissionsService: RolesPermissionsService,
  ) {}
  async oauthLogin(payload: {
    provider: 'google';
    providerId: string;
    email?: string;
    username: string;
    firstName?: string;
    lastName?: string;
  }) {
    // Try find by email or username; if not exists, create with default role
    let user = null as User | null;
    if (payload.email) {
      user = await this.usersService.findByEmail(payload.email);
    }
    if (!user) {
      user = await this.usersService.findByUsername(payload.username);
    }

    if (!user) {
      const defaultRole =
        await this.rolesPermissionsService.getRoleByName('user');
      user = await this.usersService.create({
        email: payload.email || `${payload.providerId}@google.local`,
        username: payload.username,
        firstName: payload.firstName || 'Google',
        lastName: payload.lastName || 'User',
        password: crypto.randomBytes(16).toString('hex'),
        roleId: defaultRole?.id,
      } as any);
    }

    // Issue tokens and session, like login()
    const userWithRole = await this.usersService.findOne(user.id);
    const token = this.jwtService.sign({
      email: user.email,
      sub: user.id,
      role: userWithRole.role?.name || 'user',
      jti: `${user.id}-${Date.now()}`,
    });
    const sessionId = this.generateSessionId();
    await this.sessionService.createSession(
      userWithRole,
      token,
      86400,
      sessionId,
    );
    const refreshToken =
      await this.refreshTokenService.generateRefreshTokenWithSession(
        user.id,
        sessionId,
      );

    return {
      access_token: token,
      refresh_token: refreshToken,
      session_id: sessionId,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: userWithRole.role?.name || 'user',
        permissions:
          userWithRole.role?.permissions?.map(
            (p) => `${p.resource}:${p.action}`,
          ) || [],
      },
    };
  }

  private generateSessionId(): string {
    return `session_${crypto.randomUUID()}`;
  }

  async validateUser(
    emailOrUsername: string,
    password: string,
  ): Promise<User | null> {
    let user: User | null = null;

    // Try to find user by email first, then by username

    try {
      if (emailOrUsername.includes('@')) {
        user = await this.usersService.findByEmail(emailOrUsername);
      } else {
        user = await this.usersService.findByUsername(emailOrUsername);
      }

      if (user && (await bcrypt.compare(password, user.password))) {
        const { password, ...result } = user;
        return result as User;
      }
      return null;
    } catch (error) {}
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(
      loginDto.emailOrUsername,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get user with role and permissions
    const userWithRole = await this.usersService.findOne(user.id);
    if (!userWithRole) {
      throw new UnauthorizedException('User not found');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      role: userWithRole.role?.name || 'user',
      jti: `${user.id}-${Date.now()}`, // Unique token ID
    };

    const token = this.jwtService.sign(payload);

    // Generate session ID
    const sessionId = this.generateSessionId();

    // Create session in Redis
    await this.sessionService.createSession(
      userWithRole,
      token,
      86400,
      sessionId,
    );

    // Generate refresh token with session
    const refreshToken =
      await this.refreshTokenService.generateRefreshTokenWithSession(
        user.id,
        sessionId,
      );

    return {
      access_token: token,
      refresh_token: refreshToken,
      session_id: sessionId,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: userWithRole.role?.name || 'user',
        permissions:
          userWithRole.role?.permissions?.map(
            (p) => `${p.resource}:${p.action}`,
          ) || [],
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Get role ID from DTO or default to 'user' role
    let roleId = registerDto.roleId;

    if (!roleId) {
      const defaultRole =
        await this.rolesPermissionsService.getRoleByName('user');
      if (!defaultRole) {
        throw new UnauthorizedException('Default user role not found');
      }
      roleId = defaultRole.id;
    }

    // Create user with specified or default role
    const user = await this.usersService.create({
      ...registerDto,
      roleId: roleId,
    });
    const { password, ...result } = user;

    // Get user with role and permissions
    const userWithRole = await this.usersService.findOne(user.id);
    if (!userWithRole) {
      throw new UnauthorizedException('User not found after creation');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      role: userWithRole.role?.name || 'user',
      jti: `${user.id}-${Date.now()}`, // Unique token ID
    };

    const token = this.jwtService.sign(payload);

    // Generate session ID
    const sessionId = this.generateSessionId();

    // Create session in Redis
    await this.sessionService.createSession(
      userWithRole,
      token,
      86400,
      sessionId,
    );

    // Generate refresh token with session
    const refreshToken =
      await this.refreshTokenService.generateRefreshTokenWithSession(
        user.id,
        sessionId,
      );

    return {
      access_token: token,
      refresh_token: refreshToken,
      session_id: sessionId,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: userWithRole.role?.name || 'user',
        permissions:
          userWithRole.role?.permissions?.map(
            (p) => `${p.resource}:${p.action}`,
          ) || [],
      },
    };
  }

  async logout(token: string): Promise<void> {
    // Get session data to find sessionId
    const session = await this.sessionService.getSessionByToken(token);
    if (session) {
      // Revoke refresh token by session if available
      const payload = this.jwtService.decode(token);
      if (payload && payload.jti) {
        // Extract sessionId from token or session data
        const sessionId = session.sessionId || payload.sessionId;
        if (sessionId) {
          await this.refreshTokenService.revokeRefreshTokenBySession(sessionId);
        }
      }
    }

    await this.sessionService.deleteSessionByToken(token);
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const result =
      await this.refreshTokenService.refreshAccessToken(refreshToken);
    if (!result) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return result;
  }
}

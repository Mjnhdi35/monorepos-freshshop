import { Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class SessionService {
  constructor(private readonly redisService: RedisService) {}

  private getSessionKey(userId: string): string {
    return `session:${userId}`;
  }

  private getTokenKey(token: string): string {
    return `token:${token}`;
  }

  async createSession(
    user: User,
    token: string,
    expiresIn: number = 86400,
    sessionId?: string,
  ): Promise<void> {
    const sessionData = {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role?.name || 'user',
      permissions:
        user.role?.permissions?.map((p) => `${p.resource}:${p.action}`) || [],
      sessionId: sessionId,
      createdAt: new Date().toISOString(),
    };

    // Store session data
    await this.redisService.set(
      this.getSessionKey(user.id),
      JSON.stringify(sessionData),
      expiresIn,
    );

    // Store token mapping
    await this.redisService.set(this.getTokenKey(token), user.id, expiresIn);
  }

  async getSession(userId: string): Promise<any | null> {
    const sessionData = await this.redisService.get(this.getSessionKey(userId));
    return sessionData ? JSON.parse(sessionData) : null;
  }

  async getSessionByToken(token: string): Promise<any | null> {
    const userId = await this.redisService.get(this.getTokenKey(token));
    if (!userId) {
      return null;
    }
    return this.getSession(userId);
  }

  async updateSession(
    userId: string,
    sessionData: any,
    expiresIn: number = 86400,
  ): Promise<void> {
    await this.redisService.set(
      this.getSessionKey(userId),
      JSON.stringify(sessionData),
      expiresIn,
    );
  }

  async deleteSession(userId: string): Promise<void> {
    await this.redisService.del(this.getSessionKey(userId));
  }

  async deleteSessionByToken(token: string): Promise<void> {
    const userId = await this.redisService.get(this.getTokenKey(token));
    if (userId) {
      await this.deleteSession(userId);
      await this.redisService.del(this.getTokenKey(token));
    }
  }

  async refreshSession(
    userId: string,
    expiresIn: number = 86400,
  ): Promise<void> {
    const sessionData = await this.getSession(userId);
    if (sessionData) {
      await this.updateSession(userId, sessionData, expiresIn);

      // Publish session refresh event for real-time updates
      await this.redisService.publish(
        'session:refreshed',
        JSON.stringify({
          userId,
          timestamp: new Date().toISOString(),
          expiresIn,
        }),
      );
    }
  }

  async isSessionValid(userId: string): Promise<boolean> {
    const session = await this.getSession(userId);
    return session !== null;
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const session = await this.getSession(userId);
    return session?.permissions || [];
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permission);
  }

  async hasAnyPermission(
    userId: string,
    permissions: string[],
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.some((permission) =>
      userPermissions.includes(permission),
    );
  }

  async hasAllPermissions(
    userId: string,
    permissions: string[],
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }
}

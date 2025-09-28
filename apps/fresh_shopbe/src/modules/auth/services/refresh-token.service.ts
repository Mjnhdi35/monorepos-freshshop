import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);

  constructor(
    private redisService: RedisService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  private getRefreshTokenKey(userId: string): string {
    return `refresh_token:${userId}`;
  }

  private getSessionRefreshTokenKey(sessionId: string): string {
    return `session_refresh:${sessionId}`;
  }

  private getTokenBlacklistKey(token: string): string {
    return `blacklist:${token}`;
  }

  async generateRefreshToken(
    userId: string,
    expiresIn: number = 604800,
  ): Promise<string> {
    const refreshToken = this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      { expiresIn: '7d' },
    );

    // Store refresh token in Redis with expiration
    await this.redisService.set(
      this.getRefreshTokenKey(userId),
      refreshToken,
      expiresIn,
    );

    // Publish refresh token generated event
    await this.redisService.publish(
      'refresh_token:generated',
      JSON.stringify({
        userId,
        timestamp: new Date().toISOString(),
        expiresIn,
      }),
    );

    this.logger.log(`Refresh token generated for user ${userId}`);
    return refreshToken;
  }

  async generateRefreshTokenWithSession(
    userId: string,
    sessionId: string,
    expiresIn: number = 604800,
  ): Promise<string> {
    const refreshToken = this.jwtService.sign(
      { sub: userId, type: 'refresh', sessionId },
      { expiresIn: '7d' },
    );

    // Store refresh token in Redis with session mapping
    await this.redisService.set(
      this.getSessionRefreshTokenKey(sessionId),
      refreshToken,
      expiresIn,
    );

    // Also store user mapping for quick lookup
    await this.redisService.set(
      this.getRefreshTokenKey(userId),
      refreshToken,
      expiresIn,
    );

    // Publish refresh token generated event
    await this.redisService.publish(
      'refresh_token:generated',
      JSON.stringify({
        userId,
        sessionId,
        timestamp: new Date().toISOString(),
        expiresIn,
      }),
    );

    this.logger.log(
      `Refresh token with session generated for user ${userId}, session ${sessionId}`,
    );
    return refreshToken;
  }

  async validateRefreshToken(
    token: string,
  ): Promise<{ userId: string; isValid: boolean; sessionId?: string }> {
    try {
      // Check if token is blacklisted
      const isBlacklisted = await this.redisService.exists(
        this.getTokenBlacklistKey(token),
      );
      if (isBlacklisted) {
        return { userId: '', isValid: false };
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'refresh') {
        return { userId: '', isValid: false };
      }

      const userId = payload.sub;
      const sessionId = payload.sessionId;

      // If token has sessionId, check session-based storage
      if (sessionId) {
        const sessionToken = await this.redisService.get(
          this.getSessionRefreshTokenKey(sessionId),
        );
        if (!sessionToken || sessionToken !== token) {
          return { userId: '', isValid: false };
        }
      } else {
        // Check user-based storage
        const storedToken = await this.redisService.get(
          this.getRefreshTokenKey(userId),
        );
        if (!storedToken || storedToken !== token) {
          return { userId: '', isValid: false };
        }
      }

      return { userId, isValid: true, sessionId };
    } catch (error) {
      this.logger.error('Invalid refresh token', error);
      return { userId: '', isValid: false };
    }
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    const refreshToken = await this.redisService.get(
      this.getRefreshTokenKey(userId),
    );

    if (refreshToken) {
      // Add to blacklist
      await this.redisService.set(
        this.getTokenBlacklistKey(refreshToken),
        'revoked',
        604800, // 7 days
      );
    }

    // Remove from active tokens
    await this.redisService.del(this.getRefreshTokenKey(userId));

    // Publish token revoked event
    await this.redisService.publish(
      'refresh_token:revoked',
      JSON.stringify({
        userId,
        timestamp: new Date().toISOString(),
      }),
    );

    this.logger.log(`Refresh token revoked for user ${userId}`);
  }

  async revokeRefreshTokenBySession(sessionId: string): Promise<void> {
    const refreshToken = await this.redisService.get(
      this.getSessionRefreshTokenKey(sessionId),
    );

    if (refreshToken) {
      // Add to blacklist
      await this.redisService.set(
        this.getTokenBlacklistKey(refreshToken),
        'revoked',
        604800, // 7 days
      );
    }

    // Remove from session storage
    await this.redisService.del(this.getSessionRefreshTokenKey(sessionId));

    // Publish token revoked event
    await this.redisService.publish(
      'refresh_token:revoked',
      JSON.stringify({
        sessionId,
        timestamp: new Date().toISOString(),
      }),
    );

    this.logger.log(`Refresh token revoked for session ${sessionId}`);
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string } | null> {
    const { userId, isValid, sessionId } =
      await this.validateRefreshToken(refreshToken);

    if (!isValid) {
      return null;
    }

    // Get user data
    const user = await this.usersService.findOne(userId);
    if (!user) {
      return null;
    }

    // Generate new access token
    const accessToken = this.jwtService.sign({
      email: user.email,
      sub: user.id,
      role: user.role?.name || 'user',
      jti: `${user.id}-${Date.now()}`,
    });

    // Generate new refresh token (with session if available)
    let newRefreshToken: string;
    if (sessionId) {
      newRefreshToken = await this.generateRefreshTokenWithSession(
        userId,
        sessionId,
      );
    } else {
      newRefreshToken = await this.generateRefreshToken(userId);
    }

    // Revoke old refresh token
    if (sessionId) {
      await this.revokeRefreshTokenBySession(sessionId);
    } else {
      await this.revokeRefreshToken(userId);
    }

    // Publish token refresh event for real-time updates
    await this.redisService.publish(
      'token:refreshed',
      JSON.stringify({
        userId,
        sessionId,
        timestamp: new Date().toISOString(),
        newAccessToken: accessToken,
      }),
    );

    this.logger.log(
      `Access token refreshed for user ${userId}${sessionId ? `, session ${sessionId}` : ''}`,
    );

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }

  async subscribeToTokenEvents(
    callback: (event: string, data: any) => void,
  ): Promise<void> {
    // Subscribe to token-related events
    const events = [
      'refresh_token:generated',
      'refresh_token:revoked',
      'token:refreshed',
      'session:refreshed',
    ];

    for (const event of events) {
      await this.redisService.subscribe(event, (message) => {
        try {
          const data = JSON.parse(message);
          callback(event, data);
        } catch (error) {
          this.logger.error(`Error parsing event ${event}:`, error);
        }
      });
    }
  }
}

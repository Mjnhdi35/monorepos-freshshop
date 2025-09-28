import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../../users/users.service';
import { SessionService } from '../services/session.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private sessionService: SessionService,
    private reflector: Reflector,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // First check session cache
    const session = await this.sessionService.getSession(payload.sub);

    if (session) {
      // Return cached session data
      return {
        id: session.userId,
        email: session.email,
        username: session.username,
        role: { name: session.role, permissions: session.permissions },
      };
    }

    // If not in cache, fetch from database
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    // Cache the session
    await this.sessionService.createSession(user, payload.jti || payload.sub);

    return user;
  }
}

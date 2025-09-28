import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { RefreshTokenService } from '../services/refresh-token.service';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private refreshTokenService: RefreshTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const body = request.body;

    if (!body || !body.refresh_token) {
      throw new UnauthorizedException('Refresh token is required');
    }

    // Validate refresh token
    const { userId, isValid } =
      await this.refreshTokenService.validateRefreshToken(body.refresh_token);

    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Attach userId to request for use in controller
    request.user = { id: userId };

    return true;
  }
}

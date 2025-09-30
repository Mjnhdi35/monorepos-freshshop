import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SetAuthHeadersInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const res = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        // Only set Authorization header for access token
        // Refresh token is handled via HttpOnly cookie
        if (data && data.access_token) {
          res.setHeader('Authorization', `Bearer ${data.access_token}`);
        }
        return data;
      }),
    );
  }
}

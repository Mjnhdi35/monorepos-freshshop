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
        if (
          data &&
          (data.access_token || data.refresh_token || data.session_id)
        ) {
          if (data.access_token) {
            res.setHeader('Authorization', `Bearer ${data.access_token}`);
            res.setHeader('X-Access-Token', data.access_token);
          }
          if (data.refresh_token) {
            res.setHeader('X-Refresh-Token', data.refresh_token);
          }
          if (data.session_id) {
            res.setHeader('X-Session-Id', data.session_id);
          }
        }
        return data;
      }),
    );
  }
}

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const res = http.getResponse();
    return next.handle().pipe(
      map((payload) => {
        // If already standardized, pass through
        if (
          payload &&
          typeof payload === 'object' &&
          'statusCode' in payload &&
          'data' in payload
        ) {
          return payload;
        }

        const statusCode = res?.statusCode ?? 200;
        return {
          statusCode,
          data: payload ?? null,
        };
      }),
    );
  }
}

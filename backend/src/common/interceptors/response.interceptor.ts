import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // Allow controllers to pass a custom message via data.message
        const message = data?.message || 'Request successful';
        const responseData =
          data?.message && data?.data !== undefined ? data.data : data;

        return {
          success: true,
          data: responseData,
          message,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}

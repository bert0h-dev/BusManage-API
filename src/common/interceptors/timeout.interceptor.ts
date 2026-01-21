import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, throwError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const timeoutMS = this.configService.get('security.requestTimeOut', 30000);

    return next.handle().pipe(
      timeout(timeoutMS),
      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(
            () =>
              new RequestTimeoutException(
                'La solicitud tardó demasiado tiempo. Por favor, intenta de nuevo',
              ),
          );
        }
        return throwError(() => error);
      }),
    );
  }
}

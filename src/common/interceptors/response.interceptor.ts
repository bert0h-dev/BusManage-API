import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { SuccessResponse } from '../interfaces/successResponse.interface';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const reponse = ctx.getRequest<Response>();
    const request = ctx.getRequest();
    const { url } = request;

    return next.handle().pipe(
      map((data) => {
        // Si la respuesta ya tiene ele formato de respuesta (Ejemplo un objeto con message y data)
        const statusCode = reponse.statusCode || 200;
        const timestamp = new Date().toISOString();

        let message = 'Success';
        let responseData = data;

        // Si la respuesta tiene un mensaje personalizado, extraerlo
        if (data && typeof data === 'object' && 'message' in data) {
          message = data.message;
          // Si además tiene data, usarla; si no, el resto del objeto es data
          responseData = data.data || (({ message, ...rest }) => rest)(data);
        }

        const apiResponse: SuccessResponse = {
          statusCode,
          message,
          data: responseData,
          timestamp,
          path: url,
        };

        return apiResponse;
      }),
    );
  }
}

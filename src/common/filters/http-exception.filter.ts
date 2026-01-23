import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse } from '../interfaces/errorResponse.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let errorMessage = 'Internal server error';
    let userMessage = 'Ocurrió un error procesando tu solicitud';

    // Extrae el mensaje original
    if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
      errorMessage = (exceptionResponse as any).message;
    }

    // Define mensajes seguros segun el tipo de error
    const errorMessagesMap: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'Los datos proporcionados son inválidos',
      [HttpStatus.UNAUTHORIZED]: 'Las credenciales son incorrectos',
      [HttpStatus.FORBIDDEN]: 'No tienes permiso para acceder a este recurso',
      [HttpStatus.NOT_FOUND]: 'El recurso que buscas no existe',
      [HttpStatus.CONFLICT]: 'Este recurso ya existe',
      [HttpStatus.TOO_MANY_REQUESTS]: 'Demasiadas solicitudes. Intenta más tarde',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Error interno del servidor',
    };

    // Si es un error especifico conocido, usa el mensaje seguro
    if (errorMessagesMap[status]) {
      userMessage = errorMessagesMap[status];
    }

    const errorResponse: ErrorResponse = {
      success: false,
      statusCode: status,
      error: this.getErrorType(status),
      message: userMessage,
    };

    // En desarrollo, incluye mas detalles
    if (process.env.NODE_ENV === 'development') {
      (errorResponse as any).debug = {
        path: request.url,
        method: request.method,
        timestamp: new Date().toISOString(),
        originalMessage: errorMessage,
        stack: exception.stack,
      };
    }

    response.status(status).json(errorResponse);
  }

  private getErrorType(status: number): string {
    const statusMap: Record<number, string> = {
      400: 'BadRequest',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'NotFound',
      409: 'Conflict',
      429: 'TooManyRequests',
      500: 'InternalServerError',
    };
    return statusMap[status] || 'Error';
  }
}

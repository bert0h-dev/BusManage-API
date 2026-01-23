import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    switch (exception.code) {
      case 'P2002':
        status = HttpStatus.CONFLICT;
        message = `El registro ya existe. Campo duplicado: ${exception.meta?.target}`;
        break;
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'Registro no encontrado';
        break;
      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message = 'Violación de llave foránea';
        break;
      case 'P2014':
        status = HttpStatus.BAD_REQUEST;
        message = 'Relación inválida';
        break;
      default:
        this.logger.error(`Unhandled Prisma Error code: ${exception.code}`);
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error: 'Database Error',
      code: exception.code,
    };

    this.logger.error(`Prisma Error: ${exception.code}`, JSON.stringify(errorResponse));

    response.status(status).json(errorResponse);
  }
}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Obtener configuraciones
  const configService = app.get(ConfigService);
  const port = configService.get('app.port') || 4000;
  const apiPrefix = configService.get('app.apiPrefix') || 'api';

  // =============== PIPES, FILTERS E INTERCEPTORS =================

  // Validación global de DTO's
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //Remueve propiedades no definidas en DTO
      forbidNonWhitelisted: true, //Lanza error si hay propiedades no definidas
      transform: true, //Transforma payloads a sus clases DTO
      transformOptions: {
        enableImplicitConversion: true, //Habilita conversión implícita de tipos
      },
    }),
  );

  // Filtros de excepciones
  app.useGlobalFilters(new HttpExceptionFilter());

  // Interceptors globales
  app.useGlobalInterceptors(new TimeoutInterceptor(configService), new ResponseInterceptor());

  // =============== SWAGGER / OPENAPI DOCUMENTATION =================
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Bus Management API')
    .setDescription(
      'API para sistema de gestión de autobuses con venta de boletos, manejo de unidades, rutas y personal',
    )
    .setVersion('1.0')
    .setContact('BusManage Team', '', 'support@busmanage.com')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'Autenticación y autorización')
    .addServer(`http://localhost:${port}`, 'Development')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  // =============== START SERVER =================
  await app.listen(port);

  // Logs de inicio
  const url = await app.getUrl();
  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🚌 BUS MANAGEMENT SYSTEM API                            ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝

  📍 Server running on:     ${url}
  📚 API Documentation:     ${url}/${apiPrefix}/docs
  🔧 Environment:           ${configService.get('app.env')}
  🗄️ Database:              ${configService.get('database.url') ? '✅ Connected' : '❌ Not configured'}
  
  ⏰ Started at:            ${new Date().toLocaleString()}
  
  ═══════════════════════════════════════════════════════════
  `);
}
bootstrap().catch((error) => {
  console.error('❌ Error during application bootstrap:', error);
  process.exit(1);
});

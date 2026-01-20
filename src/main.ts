import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Obtener configuraciones
  const configService = app.get(ConfigService);
  const port = configService.get('port') || 3000;
  const apiPrefix = configService.get('apiPrefix') || 'api';

  // =============== PERFORMACE =================

  // Compresión de respuestas
  app.use(compression());

  // =============== PIPES =================
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
  🔧 Environment:           ${configService.get('NODE_ENV')}
  🗄️ Database:             ${configService.get('DATABASE_URL') ? '✅ Connected' : '❌ Not configured'}
  
  ⏰ Started at:            ${new Date().toLocaleString()}
  
  ═══════════════════════════════════════════════════════════
  `);
}
bootstrap().catch((error) => {
  console.error('❌ Error during application bootstrap:', error);
  process.exit(1);
});

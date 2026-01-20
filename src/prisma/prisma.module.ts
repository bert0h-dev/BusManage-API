import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Módulo global de Prisma.
 * Este módulo se encarga de proveer y exportar la instancia de PrismaService
 * para que pueda ser utilizada en cualquier otro módulo de la aplicación sin necesidad de importarlo explícitamente.
 */

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

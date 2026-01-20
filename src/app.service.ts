import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return '🚌 Bus Management API - Running';
  }

  async healthCheck() {
    const dbHealthy = await this.prisma.healthCheck();
    const stats = await this.prisma.getStats();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: dbHealthy,
        stats,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024), // in MB
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024), // in MB
        unit: 'MB',
      },
    };
  }

  getVersion() {
    return {
      version: '1.0.0',
      apiVersion: 'v1',
      name: 'Bus Management API',
    };
  }
}

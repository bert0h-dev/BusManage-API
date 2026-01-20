import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m', // Access token: 15 minutos
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // Refresh token: 7 días
}));

import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secretTtl: process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long',
  accessTokenTtl: process.env.JWT_EXPIRES_IN || '15m', // Access token: 15 minutos
  refreshTokenTtl: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // Refresh token: 7 días
}));

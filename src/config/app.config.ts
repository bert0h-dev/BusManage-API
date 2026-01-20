import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 4000,
  apiPrefix: process.env.API_PREFIX || 'api',
}));

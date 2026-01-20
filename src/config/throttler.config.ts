import { registerAs } from '@nestjs/config';

export default registerAs('throttler', () => ({
  ttl: parseInt(process.env.THROTTLE_TTL || '60', 10), // TTL global en segundos
  limit: parseInt(process.env.THROTTLE_LIMIT || '10', 10), // Limit global
}));

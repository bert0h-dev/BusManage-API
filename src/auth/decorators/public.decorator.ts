import { SetMetadata } from '@nestjs/common';

export const IS_PUBLICK_KEY = 'isPublic';

/**
 * Decorator para marcar una ruta como pública (sin autenticación)
 * Debe usarse con JwtAuthGuard global
 *
 * Uso:
 * @Public()
 * @Post('login')
 */
export const Public = () => SetMetadata(IS_PUBLICK_KEY, true);

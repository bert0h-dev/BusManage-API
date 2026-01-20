import { UserRole } from '@prisma/client';

/**
 * Estructura del payload del JWT
 */
export interface JwtPayload {
  sub: string; // User ID
  email: string; // Email del usuario
  role: UserRole; // Rol del usuario
  iat?: number; // Fecha de creación del token (timestamp)
  exp?: number; // Fecha de expiración del token (timestamp)
}

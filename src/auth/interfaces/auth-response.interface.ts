import { UserRole } from '@prisma/client';

/**
 * Respuesta de autenticación (login/register)
 */
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
  };
  token: string;
}

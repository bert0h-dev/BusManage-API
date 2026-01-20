import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Decorator para especificar qué roles pueden acceder a una ruta
 * Debe usarse junto con RolesGuard
 *
 * Uso:
 * @Roles('admin', 'coordinator')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { RequiredPermission } from '../interfaces/required-permission.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<RequiredPermission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Verificar cada permiso requerido
    for (const permission of requiredPermissions) {
      const hasPermission = await this.authService.hasPermission(
        user.id,
        permission.module,
        permission.action,
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `No tienes permiso para ${permission.action} en ${permission.module}`,
        );
      }
    }

    return true;
  }
}

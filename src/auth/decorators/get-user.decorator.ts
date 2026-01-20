import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator para obtener el usuario autenticado desde el request
 * Uso: @GetUser() user: User
 * Uso: @GetUser('id') userId: string
 * Uso: @GetUser('email') email: string
 */
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Si se especifica un campo, retorna solo ese campo
    if (data) {
      return user?.[data];
    }

    // Si no, retorna el usuario completo
    return user;
  },
);

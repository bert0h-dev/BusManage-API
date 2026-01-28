import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidCredentialsException extends HttpException {
  constructor() {
    super('Las Credenciales son incorrectos', HttpStatus.UNAUTHORIZED);
  }
}

export class EmailAlreadyExistsException extends HttpException {
  constructor() {
    super('Este email ya está registrado', HttpStatus.CONFLICT);
  }
}

export class UserNotActiveException extends HttpException {
  constructor() {
    super('Tu cuenta está desactivada', HttpStatus.FORBIDDEN);
  }
}

export class InvalidTokenException extends HttpException {
  constructor(tokenType: string = 'token') {
    super(`El ${tokenType} es inválido o ha expirado`, HttpStatus.UNAUTHORIZED);
  }
}

export class PasswordTooWeakException extends HttpException {
  constructor(requirements: string[]) {
    const message = `La contraseña debe contener: ${requirements.join(', ')}`;
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class UserNotFoundException extends HttpException {
  constructor() {
    super('Usuario no encontrado', HttpStatus.NOT_FOUND);
  }
}

export class InvalidCurrentPasswordException extends HttpException {
  constructor() {
    super('La contraseña actual es incorrecta', HttpStatus.BAD_REQUEST);
  }
}

export class InvalidPermissionException extends HttpException {
  constructor() {
    super('No tienes permiso para realizar esta acción', HttpStatus.FORBIDDEN);
  }
}

export class ModuleNotFoundException extends HttpException {
  constructor(moduleName: string = 'seleccionado') {
    super(`Módulo ${moduleName} no encontrado`, HttpStatus.NOT_FOUND);
  }
}

export class PermissionNotFoundException extends HttpException {
  constructor(moduleName: string, action: string) {
    super(`Permiso ${moduleName} no encontrado para el módulo ${moduleName}`, HttpStatus.NOT_FOUND);
  }
}

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { PermissionAction, UserRole } from '@prisma/client';
import { ChangePassowrdDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  EmailAlreadyExistsException,
  InvalidCredentialsException,
  InvalidCurrentPasswordException,
  InvalidTokenException,
  ModuleNotFoundException,
  PasswordTooWeakException,
  PermissionNotFoundException,
  UserNotActiveException,
  UserNotFoundException,
} from '../common/exceptions/auth.exception';
import { MessageOnlyResponseDto, SuccessResponseDto } from '../common/dtos/response.dto';
import path from 'path';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ============= MÉTODOS PARA MANEJO DE SESIONES =============

  /**
   * Login
   */
  async login(LoginDto: LoginDto): Promise<SuccessResponseDto> {
    const { identifier, password } = LoginDto;

    // Buscar usuario por email o por número de empleado
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          {
            staff: {
              employeeNumber: identifier,
            },
          },
        ],
      },
      include: {
        staff: true,
      },
    });

    if (!user) {
      throw new InvalidCredentialsException();
    }

    // Verificar si está activo
    if (!user.isActive) {
      throw new UserNotActiveException();
    }

    // Verificar contraseña
    const isPassowrdValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPassowrdValid) {
      throw new InvalidCredentialsException();
    }

    // Actualizar último login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generar token
    const tokens = await this.generateTokenPair(user.id, user.email, user.role);

    const userReturn = {
      id: user.id,
      email: user.email,
      fullnName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      staff: user.staff
        ? {
            employeeNumber: user.staff.employeeNumber,
            role: user.staff.role,
          }
        : null,
    };

    return {
      message: 'Login exitoso',
      data: {
        user: userReturn,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  /**
   * Renovar access token usando refresh token
   */
  async refreshAccessToken(refreskTokenDto: RefreshTokenDto): Promise<SuccessResponseDto> {
    const { refreshToken } = refreskTokenDto;

    try {
      // Verificar que el refresh token sea valido
      const payload = this.jwtService.verify(refreshToken);

      if (payload.type !== 'refresh') {
        throw new InvalidTokenException('refresh token');
      }

      // Buscar usuario
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new InvalidTokenException('refresh token');
      }

      // Verificar que el refresh token coincida con el guardado
      const isTokenValid = await bcrypt.compare(refreshToken, user.refreshTokenHash || '');
      if (!isTokenValid) {
        throw new InvalidTokenException('refresh token');
      }

      // Genera nuevo par de tokens
      const tokens = await this.generateTokenPair(user.id, user.email, user.role);

      return {
        message: 'Tokens renovados exitosamente',
        data: tokens,
      };
    } catch (error) {
      throw new InvalidTokenException('refresh token');
    }
  }

  /**
   * Logout de usuario - Revocar refresh token
   */
  async logout(userId: string): Promise<MessageOnlyResponseDto> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: null,
        refreshTokenCreatedAt: null,
        refreshTokenExpiresAt: null,
      },
    });

    return { message: 'Sesión cerrada correctamente' };
  }

  // ============= MÉTODOS PARA MANEJO DE USUARIOS =============

  /**
   * Registrar nuevo usuario
   */
  async register(registerDto: RegisterDto): Promise<SuccessResponseDto> {
    const { email, password, fullName, role } = registerDto;

    // Verificar si el email ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new EmailAlreadyExistsException();
    }

    this.validatePasswordStrength(password);

    // Hash de la contraseña
    const hashedPassword = await this.hashPassword(password);

    // Crear usuario
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        fullName,
        role: role || 'viewer',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Generar token
    const tokens = await this.generateTokenPair(user.id, user.email, user.role);

    return {
      message: 'Usuario registrado exitosamente',
      data: {
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  /**
   * Validar usuario desde JWT
   */
  async validateUser(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    if (!user.isActive) {
      throw new UserNotActiveException();
    }

    return user;
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        staff: {
          select: {
            employeeNumber: true,
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new InvalidCredentialsException();
    }

    return user;
  }

  /**
   * Cambiar contraseña (usuario autenticado)
   */
  async changePassowrd(
    userId: string,
    changePassowrdDto: ChangePassowrdDto,
  ): Promise<MessageOnlyResponseDto> {
    const { currentPassword, newPassword } = changePassowrdDto;

    // Buscar usuario
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw new InvalidCurrentPasswordException();
    }

    this.validatePasswordStrength(newPassword);

    // Hash de nueva contraseña
    const hashedPassword = await this.hashPassword(newPassword);

    // Actualizar contraseña
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  /**
   * Solicitar restablecimiento de contraseña del usuario
   */
  async forgotPassowrd(forgotPassowrdDto: ForgotPasswordDto): Promise<MessageOnlyResponseDto> {
    const { identifier } = forgotPassowrdDto;

    // Buscar usuario
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          {
            staff: {
              employeeNumber: identifier,
            },
          },
        ],
      },
      include: {
        staff: true,
      },
    });

    // No revelar si el usuario existe o no
    if (!user) {
      throw new UserNotFoundException();
    }

    // Generar token de reset
    const resetTokenTtlMs: number = this.configService.get('security.resetTokenTtlMs', 3600000);
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + resetTokenTtlMs);

    // Guardar token en la base de datos
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Aqui va el envio email con el link

    return {
      message: 'Recibirás a tu email instrucciones para restablecer tu contraseña',
    };
  }

  /**
   * Restablecer contraseña del usuario con token
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<MessageOnlyResponseDto> {
    const { token, newPassword } = resetPasswordDto;

    // Buscar usuario con el token válido
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      throw new InvalidTokenException();
    }

    // Hash de nueva contraseña
    const hashedPassword = await this.hashPassword(newPassword);

    // Actualizar contraseña y limpiar token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Aqui se envia el email de confirmacion

    return { message: 'Contraseña restablecida exitosamente' };
  }

  // ============= MÉTODOS PARA PERMISOS =============

  /**
   * Verifica si un usuario tiene permiso para realizar una acción en un modulo
   */
  async hasPermission(
    userId: string,
    moduleName: string,
    action: PermissionAction,
  ): Promise<boolean> {
    // Obtener el usuario
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) return false;

    // Buscar el modulo
    const module = await this.prisma.module.findUnique({
      where: { name: moduleName, isActive: true },
    });

    if (!module) return false;

    // Buscar el permiso especifico
    const permission = await this.prisma.permission.findUnique({
      where: {
        moduleId_action: {
          moduleId: module.id,
          action,
        },
        isActive: true,
      },
    });

    if (!permission) return false;

    // Primero verificar si hay un permiso especifico para el usuario
    const userPermission = await this.prisma.rolePermission.findUnique({
      where: {
        userId_moduleId_permissionId: {
          userId: userId,
          moduleId: module.id,
          permissionId: permission.id,
        },
      },
    });

    // Si existe un permiso especifico del usuario usar ese
    if (userPermission) return userPermission.granted;

    // Si no, verificar el permiso por rol
    const rolePermission = await this.prisma.rolePermission.findUnique({
      where: {
        userRole_moduleId_permissionId: {
          userRole: user.role,
          moduleId: module.id,
          permissionId: permission.id,
        },
      },
    });

    return rolePermission ? rolePermission.granted : false;
  }

  /**
   * Verificar si un usuario puede acceder a un módulo (al menos con permiso 'view')
   */
  async canAccessModule(userId: string, moduleName: string): Promise<boolean> {
    return this.hasPermission(userId, moduleName, PermissionAction.view);
  }

  /**
   * Obtener todos los módulos a los que un usuario tiene acceso
   */
  async getUserModules(userId: string) {
    // Se obtiene el usuario
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) return [];

    // Obtener los permisos
    const rolePermission = await this.prisma.rolePermission.findMany({
      where: {
        userRole: user.role,
        granted: true,
        module: {
          parentId: null,
          isActive: true,
        },
        permission: {
          action: PermissionAction.view,
          isActive: true,
        },
      },
      select: {
        id: true,
        granted: true,
        module: {
          select: {
            id: true,
            name: true,
            displayName: true,
            icon: true,
            order: true,
            menuType: true,
            path: true,
          },
        },
        permission: {
          select: {
            id: true,
            action: true,
            description: true,
          },
        },
      },
      orderBy: {
        module: {
          order: 'asc',
        },
      },
    });

    const modulesMap = new Map();

    for (const rp of rolePermission) {
      // Se guarda el modulo principal
      modulesMap.set(rp.module.id, {
        id: rp.module.id,
        name: rp.module.name,
        displayName: rp.module.displayName,
        icon: rp.module.icon,
        order: rp.module.order,
        menuType: rp.module.menuType,
        path: rp.module.path,
        subModules: [],
      });

      // Se obtienen los submodulos
      const subModules = await this.prisma.rolePermission.findMany({
        where: {
          userRole: user.role,
          granted: true,
          module: {
            parentId: rp.module.id,
            isActive: true,
          },
          permission: {
            action: PermissionAction.view,
            isActive: true,
          },
        },
        select: {
          id: true,
          granted: true,
          module: {
            select: {
              id: true,
              name: true,
              displayName: true,
              icon: true,
              order: true,
              menuType: true,
              path: true,
            },
          },
          permission: {
            select: {
              id: true,
              action: true,
              description: true,
            },
          },
        },
        orderBy: {
          module: {
            order: 'asc',
          },
        },
      });

      // Se recorren los submodulos para agregarlos al modulo
      if (subModules) {
        for (const smrp of subModules) {
          const subModule = modulesMap.get(rp.module.id);
          if (subModule) {
            subModule.subModules.push({
              id: smrp.module.id,
              name: smrp.module.name,
              displayName: smrp.module.displayName,
              order: smrp.module.order,
              menuType: smrp.module.menuType,
              path: smrp.module.path,
            });
          }
        }
      }
    }

    return Array.from(modulesMap.values()).sort((a, b) => a.order - b.order);
  }

  /**
   * Obtener todos los permisos de un usuario para un módulo especifico
   */
  async getUserModulePermissions(userId: string, moduleName: string): Promise<PermissionAction[]> {
    // Se obtiene el usuario
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) return [];

    const module = await this.prisma.module.findUnique({
      where: { name: moduleName, isActive: true },
    });

    if (!module) return [];

    // Obtener permisos del rol
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: {
        userRole: user.role,
        moduleId: module.id,
        granted: true,
      },
      include: {
        permission: true,
      },
    });

    // Obtener permisos personalizados del usuario
    const userPermissions = await this.prisma.rolePermission.findMany({
      where: {
        userId: userId,
        moduleId: module.id,
        granted: true,
      },
      include: {
        permission: true,
      },
    });

    // Combinar permisos (los del usuario tienen prioridad)
    const permissionsSet = new Set<PermissionAction>();

    rolePermissions.forEach((rp) => {
      if (rp.permission.isActive) {
        permissionsSet.add(rp.permission.action);
      }
    });

    userPermissions.forEach((up) => {
      if (up.permission.isActive) {
        permissionsSet.add(up.permission.action);
      }
    });

    return Array.from(permissionsSet);
  }

  /**
   * Asigna un permiso personalizado a un usuario
   */
  async assignUserPermission(
    userId: string,
    moduleName: string,
    action: PermissionAction,
    granted: boolean = true,
  ): Promise<MessageOnlyResponseDto> {
    const module = await this.prisma.module.findUnique({
      where: { name: moduleName },
    });

    if (!module) {
      throw new ModuleNotFoundException(moduleName);
    }

    const permission = await this.prisma.permission.findUnique({
      where: {
        moduleId_action: {
          moduleId: module.id,
          action,
        },
      },
    });

    if (!permission) {
      throw new PermissionNotFoundException(moduleName, action);
    }

    const assingPermission = await this.prisma.rolePermission.upsert({
      where: {
        userId_moduleId_permissionId: {
          userId: userId,
          moduleId: module.id,
          permissionId: permission.id,
        },
      },
      update: {
        granted: granted,
      },
      create: {
        userId: userId,
        moduleId: module.id,
        permissionId: permission.id,
        granted: granted,
      },
    });

    return { message: 'Permiso asignado correctamente' };
  }

  /**
   * Elimina un permiso personalizado de un usuario
   */
  async removeUserPermission(
    userId: string,
    moduleName: string,
    action: PermissionAction,
  ): Promise<MessageOnlyResponseDto> {
    const module = await this.prisma.module.findUnique({
      where: { name: moduleName },
    });

    if (!module) {
      throw new ModuleNotFoundException(moduleName);
    }

    const permission = await this.prisma.permission.findUnique({
      where: {
        moduleId_action: {
          moduleId: module.id,
          action,
        },
      },
    });

    if (!permission) {
      throw new PermissionNotFoundException(moduleName, action);
    }

    const removeUserPermission = await this.prisma.rolePermission.delete({
      where: {
        userId_moduleId_permissionId: {
          userId: userId,
          moduleId: module.id,
          permissionId: permission.id,
        },
      },
    });

    return { message: 'Permiso eliminado correctamente' };
  }

  // ============= MÉTODOS PRIVADOS =============

  /**
   * Genera access token (Corta duracion)
   */
  private generateAccessToken(userId: string, email: string, role: UserRole): string {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
      type: 'access',
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('jwt.accessTokenTtl', '15m'),
    });
  }

  /**
   * Generar refresh token (larga duración)
   */
  private generateRefreshToken(userId: string, email: string, role: UserRole): string {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('jwt.refreshTokenTtl', '15m'),
    });
  }

  /**
   * Generar ambos tokens
   */
  private async generateTokenPair(
    userId: string,
    email: string,
    role: UserRole,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.generateAccessToken(userId, email, role);
    const refreshToken = this.generateRefreshToken(userId, email, role);

    // Guardar refresh token hasheado en BD con timestamps para auditoría
    const hashedRefreshToken = await this.hashPassword(refreshToken);
    const now = new Date();
    const refreshTokenExpiresAt = new Date(
      now.getTime() + this.parseTimeStringToMs(this.configService.get('jwt.refreshTokenTtl', '7d')),
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: hashedRefreshToken,
        refreshTokenCreatedAt: now,
        refreshTokenExpiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  // ============= MÉTODOS PRIVADOS =============

  /**
   * Hash de contraseña
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = this.configService.get('security.bcryptRounds', 10);
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Utility para convertir "7d", "15m", etc en milisegundos
   */
  private parseTimeStringToMs(timeStr: string): number {
    const match = timeStr.match(/(\d+)([smhd])/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7 días

    const amount = parseInt(match[1], 10);
    const unit = match[2];

    const units: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return amount * (units[unit] || 1000);
  }

  /**
   * Validar fortaleza de contraseña
   */
  private validatePasswordStrength(password: string): void {
    const minLength = this.configService.get('security.passwordMinLength');
    const requireUppercase = this.configService.get('security.passwordRequireUppercase', false);
    const requireNumbers = this.configService.get('security.passwordRequireNumbers', false);
    const requireSpecialChars = this.configService.get(
      'security.passwordRequireSpecialChars',
      false,
    );

    const requirements: string[] = [];

    if (password.length < minLength) {
      requirements.push(`mínimo ${minLength} caracteres`);
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
      requirements.push('una letra mayúscula');
    }

    if (requireNumbers && !/[0-9]/.test(password)) {
      requirements.push('un número');
    }

    if (requireSpecialChars && !/[!@#$%^&*]/.test(password)) {
      requirements.push('un carácter especial (!@#$%^&*)');
    }

    if (requirements.length > 0) {
      throw new PasswordTooWeakException(requirements);
    }
  }
}

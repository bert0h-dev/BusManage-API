import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserRole } from '@prisma/client';
import { ChangePassowrdDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  EmailAlreadyExistsException,
  InvalidCredentialsException,
  InvalidCurrentPasswordException,
  InvalidTokenException,
  PasswordTooWeakException,
  UserNotFoundException,
} from '../common/exceptions/auth.exception';
import { MessageOnlyResponseDto, SuccessResponseDto } from '../common/dtos/response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

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
   * Login de usuario
   */
  async login(LoginDto: LoginDto): Promise<SuccessResponseDto> {
    const { email, password } = LoginDto;

    // Buscar usuario
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new InvalidCredentialsException();
    }

    // Verificar si está activo
    if (!user.isActive) {
      throw new InvalidCredentialsException();
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

    // Remover password del objeto
    const { passwordHash, ...userWithoutPassowrd } = user;

    return {
      message: 'Login exitoso',
      data: {
        user: userWithoutPassowrd,
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
        fullName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
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
   * Solicitar restablecimiento de contraseña
   */
  async forgotPassowrd(forgotPassowrdDto: ForgotPasswordDto): Promise<MessageOnlyResponseDto> {
    const { email } = forgotPassowrdDto;

    // Buscar usuario
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // No revelar si el usuario existe o no
    if (!user) {
      return {
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña*',
      };
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
      message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña',
    };
  }

  /**
   * Restablecer contraseña con token
   */
  async resetpassword(resetPasswordDto: ResetPasswordDto): Promise<MessageOnlyResponseDto> {
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
      throw new BadRequestException('Token inválido o expirado');
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
   * Logout - Revocar refresh token
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

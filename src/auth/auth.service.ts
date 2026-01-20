import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthResponse } from './interfaces/auth-response.interface';
import { UserRole } from '@prisma/client';
import { ChangePassowrdDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, fullName, role } = registerDto;

    // Verificar si el email ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

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
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user,
      token,
    };
  }

  /**
   * Login de usuario
   */
  async login(LoginDto: LoginDto): Promise<AuthResponse> {
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
      throw new UnauthorizedException('Credenciables inválidad');
    }

    // Verificar si está activo
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Verificar contraseña
    const isPassowrdValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPassowrdValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizar último login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generar token
    const token = this.generateToken(user.id, user.email, user.role);

    // Remover password del objeto
    const { passwordHash, ...userWithoutPassowrd } = user;

    return {
      user: userWithoutPassowrd,
      token,
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
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePassowrdDto;

    // Buscar usuario
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Contraseña actual incorrecta');
    }

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
  async forgotPassowrd(
    forgotPassowrdDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPassowrdDto;

    // Buscar usuario
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // No revelar si el usuario existe o no
    if (!user) {
      return {
        message:
          'Si el email existe, recibirás instrucciones para restablecer tu contraseña*',
      };
    }

    // Generar token de reset (válido por 1 hora)
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

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
      message:
        'Si el email existe, recibirás instrucciones para restablecer tu contraseña',
    };
  }

  /**
   * Restablecer contraseña con token
   */
  async resetpassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
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
   * Verificar si un token es válido
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      return !!user && user.isActive;
    } catch {
      return false;
    }
  }

  // ============= MÉTODOS PRIVADOS =============

  /**
   * Generar token JWT
   */
  private generateToken(userId: string, email: string, role: UserRole): string {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Hash de contraseña
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}

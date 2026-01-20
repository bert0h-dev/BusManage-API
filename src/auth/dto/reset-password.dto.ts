import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'abc123def456...',
    description: 'Token de restablecimiento recibido por email',
  })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'NewPassword123!',
    description: 'Nueva contraseña',
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  newPassword: string;
}

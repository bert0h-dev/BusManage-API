import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePassowrdDto {
  @ApiProperty({
    example: 'CurrentPassword123!',
    description: 'Contraseña actual',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    example: 'NewPassword123!',
    description: 'Nueva contraseña (mínimo 8 caracteres)',
  })
  @IsString()
  @MinLength(8, {
    message: 'La nueva contraseña debe tener al menos 8 caracteres',
  })
  newPassword: string;
}

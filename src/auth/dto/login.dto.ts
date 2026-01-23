import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'EMP-001 o admin@busmanage.com',
    description: 'Numero de empleado o Email del usuario',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({
    example: 'Admin123!',
    description: 'Contraseña del usuario',
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;
}

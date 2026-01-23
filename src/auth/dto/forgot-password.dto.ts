import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'EMP-001 o admin@busmanage.com',
    description: 'Numero de empleado o Email del usuario',
  })
  @IsString()
  identifier: string;
}

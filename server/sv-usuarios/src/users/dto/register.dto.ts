/**
 * DTO de cadastro de usuário. Define e valida nome, e-mail e senha recebidos
 * no corpo da requisição de registro.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 20/06/2026
 * Atualização: 07/07/2026
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'senha1234' })
  @IsString()
  @MinLength(8)
  password!: string;
}

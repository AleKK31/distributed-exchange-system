/**
 * DTO de login. Define e valida e-mail e senha recebidos no corpo da
 * requisição de autenticação.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 20/06/2026
 * Atualização: 07/07/2026
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'senha1234' })
  @IsString()
  password!: string;
}

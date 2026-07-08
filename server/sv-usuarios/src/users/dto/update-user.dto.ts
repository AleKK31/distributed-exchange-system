/**
 * DTO de atualização de usuário. Define e valida os campos opcionais (nome e
 * senha) aceitos na atualização de perfil.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 20/06/2026
 * Atualização: 07/07/2026
 */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'João Atualizado' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: 'novasenha1234' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}

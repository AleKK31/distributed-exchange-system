/**
 * DTO de atualização de publicação. Define e valida os campos opcionais
 * editáveis (item ofertado, item desejado, categoria e descrição).
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 20/06/2026
 * Atualização: 07/07/2026
 */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdatePublicacaoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  item_oferto?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  item_desejado?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() categoria?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao?: string;
}

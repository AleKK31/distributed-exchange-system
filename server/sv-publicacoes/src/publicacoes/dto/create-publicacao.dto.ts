/**
 * DTO de criação de publicação. Define e valida os campos do item ofertado,
 * item desejado, categoria e descrição opcional.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 20/06/2026
 * Atualização: 07/07/2026
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePublicacaoDto {
  @ApiProperty({ example: 'Bicicleta azul' })
  @IsString()
  @MinLength(2)
  item_oferto!: string;

  @ApiProperty({ example: 'Patinete elétrico' })
  @IsString()
  @MinLength(2)
  item_desejado!: string;

  @ApiProperty({ example: 'Esportes' })
  @IsString()
  categoria!: string;

  @ApiPropertyOptional({
    example: 'Bicicleta em ótimo estado, usada por 1 ano.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao?: string;
}

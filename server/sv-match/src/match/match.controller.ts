/**
 * Controller HTTP de match. Expõe a listagem e o detalhe das propostas do
 * usuário e as ações de aceitar/recusar uma proposta, retornando o envelope
 * padrão { status, data? }.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 21/06/2026
 * Atualização: 07/07/2026
 */
import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RespostaStatus } from './entities/proposta.entity';
import { MatchService } from './match.service';

@ApiTags('match')
@Controller('match')
export class MatchController {
  constructor(private readonly service: MatchService) {}

  @Get('minhas')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista as propostas do usuário autenticado' })
  /**
   * Lista as propostas do usuário autenticado.
   * @param req Requisição com req.user preenchido pelo JwtAuthGuard.
   * @returns Envelope com as propostas do usuário.
   */
  async listarMinhas(@Request() req: { user: { id: string } }) {
    const data = await this.service.listarMinhas(req.user.id);
    return { status: 200, data };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detalhe de uma proposta (participante)' })
  /**
   * Retorna o detalhe de uma proposta em que o usuário participa.
   * @param id Id da proposta.
   * @param req Requisição com req.user preenchido pelo JwtAuthGuard.
   * @returns Envelope com a proposta.
   */
  async buscar(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.service.buscarParticipante(id, req.user.id);
    return { status: 200, data };
  }

  @Post(':id/aceitar')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aceita uma proposta' })
  /**
   * Registra o aceite do usuário autenticado para uma proposta.
   * @param id Id da proposta.
   * @param req Requisição com req.user preenchido pelo JwtAuthGuard.
   * @returns Envelope com a proposta atualizada.
   */
  async aceitar(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.service.responder(
      id,
      req.user.id,
      RespostaStatus.ACEITO,
    );
    return { status: 200, data };
  }

  @Post(':id/recusar')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Recusa uma proposta' })
  /**
   * Registra a recusa do usuário autenticado para uma proposta.
   * @param id Id da proposta.
   * @param req Requisição com req.user preenchido pelo JwtAuthGuard.
   * @returns Envelope com a proposta atualizada.
   */
  async recusar(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.service.responder(
      id,
      req.user.id,
      RespostaStatus.RECUSADO,
    );
    return { status: 200, data };
  }
}

/**
 * Controller HTTP de notificações. Expõe a listagem das notificações do
 * usuário e a marcação de uma notificação como lida, retornando o envelope
 * padrão { status, data? }.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 23/06/2026
 * Atualização: 07/07/2026
 */
import {
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificacaoService } from './notificacao.service';

@ApiTags('notificacoes')
@Controller('notificacoes')
export class NotificacaoController {
  constructor(private readonly service: NotificacaoService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista as notificações do usuário autenticado' })
  /**
   * Lista as notificações do usuário autenticado.
   * @param req Requisição com req.user preenchido pelo JwtAuthGuard.
   * @returns Envelope com as notificações do usuário.
   */
  async listarMinhas(@Request() req: { user: { id: string } }) {
    const data = await this.service.listarMinhas(req.user.id);
    return { status: 200, data };
  }

  @Patch(':id/lida')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marca uma notificação como lida' })
  /**
   * Marca uma notificação do usuário autenticado como lida.
   * @param id Id da notificação.
   * @param req Requisição com req.user preenchido pelo JwtAuthGuard.
   * @returns Envelope com a notificação atualizada.
   */
  async marcarLida(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.service.marcarLida(id, req.user.id);
    return { status: 200, data };
  }
}

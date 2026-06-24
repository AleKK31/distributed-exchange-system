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
  async listarMinhas(@Request() req: { user: { id: string } }) {
    const data = await this.service.listarMinhas(req.user.id);
    return { status: 200, data };
  }

  @Patch(':id/lida')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marca uma notificação como lida' })
  async marcarLida(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.service.marcarLida(id, req.user.id);
    return { status: 200, data };
  }
}

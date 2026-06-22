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
  async listarMinhas(@Request() req: { user: { id: string } }) {
    const data = await this.service.listarMinhas(req.user.id);
    return { status: 200, data };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detalhe de uma proposta (participante)' })
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

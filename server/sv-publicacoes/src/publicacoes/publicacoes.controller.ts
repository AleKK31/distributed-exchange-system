import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePublicacaoDto } from './dto/create-publicacao.dto';
import { ListPublicacoesDto } from './dto/list-publicacoes.dto';
import { UpdatePublicacaoDto } from './dto/update-publicacao.dto';
import { PublicacoesService } from './publicacoes.service';

@ApiTags('publicacoes')
@Controller('publicacoes')
export class PublicacoesController {
  constructor(private readonly service: PublicacoesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria uma nova publicação' })
  @ApiResponse({ status: 201, description: 'Publicação criada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async create(
    @Body() dto: CreatePublicacaoDto,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.service.create(dto, req.user.id);
    return { status: 201, message: 'Publicação criada com sucesso', data };
  }

  @Get()
  @ApiOperation({ summary: 'Lista publicações com filtros opcionais' })
  @ApiResponse({ status: 200 })
  async findAll(@Query() query: ListPublicacoesDto) {
    const result = await this.service.findAll(query);
    return { status: 200, ...result };
  }

  @Get('minhas')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista publicações do usuário autenticado' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findMinhas(@Request() req: { user: { id: string } }) {
    const data = await this.service.findByUsuario(req.user.id);
    return { status: 200, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna detalhe de uma publicação' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Publicação não encontrada' })
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { status: 200, data };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza uma publicação (apenas o dono)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403, description: 'Proibido' })
  @ApiResponse({ status: 404, description: 'Publicação não encontrada' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePublicacaoDto,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.service.update(id, dto, req.user.id);
    return { status: 200, data };
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove (soft delete) uma publicação' })
  @ApiResponse({ status: 200, description: 'Publicação removida com sucesso' })
  @ApiResponse({ status: 403, description: 'Proibido' })
  @ApiResponse({ status: 404, description: 'Publicação não encontrada' })
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    await this.service.remove(id, req.user.id);
    return { status: 200, message: 'Publicação removida com sucesso' };
  }
}

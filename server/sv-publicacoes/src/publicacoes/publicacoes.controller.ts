/**
 * Controller HTTP de publicações. Expõe o CRUD de itens para troca (criar,
 * listar com filtros, listar as próprias, detalhar, atualizar e remover),
 * retornando o envelope padrão { status, message?, data? }.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 20/06/2026
 * Atualização: 07/07/2026
 */
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
  /**
   * Cria uma nova publicação para o usuário autenticado.
   * @param dto Dados da publicação.
   * @param req Requisição com req.user preenchido pelo JwtAuthGuard.
   * @returns Envelope com a publicação criada.
   */
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
  /**
   * Lista publicações aplicando os filtros e paginação informados.
   * @param query Filtros e paginação.
   * @returns Envelope com a lista e os metadados de paginação.
   */
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
  /**
   * Lista as publicações do usuário autenticado.
   * @param req Requisição com req.user preenchido pelo JwtAuthGuard.
   * @returns Envelope com as publicações do usuário.
   */
  async findMinhas(@Request() req: { user: { id: string } }) {
    const data = await this.service.findByUsuario(req.user.id);
    return { status: 200, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna detalhe de uma publicação' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Publicação não encontrada' })
  /**
   * Retorna o detalhe de uma publicação.
   * @param id Id da publicação.
   * @returns Envelope com a publicação.
   */
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
  /**
   * Atualiza uma publicação do usuário autenticado.
   * @param id Id da publicação.
   * @param dto Campos a atualizar.
   * @param req Requisição com req.user preenchido pelo JwtAuthGuard.
   * @returns Envelope com a publicação atualizada.
   */
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
  /**
   * Remove (soft delete) uma publicação do usuário autenticado.
   * @param id Id da publicação.
   * @param req Requisição com req.user preenchido pelo JwtAuthGuard.
   * @returns Envelope de confirmação da remoção.
   */
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    await this.service.remove(id, req.user.id);
    return { status: 200, message: 'Publicação removida com sucesso' };
  }
}

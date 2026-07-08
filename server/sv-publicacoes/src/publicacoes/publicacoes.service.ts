/**
 * Serviço de negócio de publicações. Faz o CRUD de itens para troca, emite os
 * eventos publicacao.* no RabbitMQ e reage aos eventos match.* atualizando o
 * status das publicações (disponivel/negociando/trocado/removido).
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 20/06/2026
 * Atualização: 07/07/2026
 */
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RMQ_CLIENT } from '../rmq/rmq.client';
import { CreatePublicacaoDto } from './dto/create-publicacao.dto';
import { ListPublicacoesDto } from './dto/list-publicacoes.dto';
import { UpdatePublicacaoDto } from './dto/update-publicacao.dto';
import { Publicacao, PublicacaoStatus } from './entities/publicacao.entity';

@Injectable()
export class PublicacoesService {
  private readonly logger = new Logger(PublicacoesService.name);

  constructor(
    @InjectRepository(Publicacao)
    private readonly repo: Repository<Publicacao>,
    @Inject(RMQ_CLIENT)
    private readonly rmqClient: ClientProxy,
  ) {}

  /**
   * Cria uma publicação disponível e emite publicacao.criada.
   * @param dto Dados do item ofertado/desejado, categoria e descrição.
   * @param usuarioId Id do dono da publicação.
   * @returns A publicação criada.
   */
  async create(dto: CreatePublicacaoDto, usuarioId: string) {
    const pub = this.repo.create({
      ...dto,
      usuario_id: usuarioId,
      status: PublicacaoStatus.DISPONIVEL,
    });
    const saved = await this.repo.save(pub);

    this.rmqClient.emit('publicacao.criada', {
      id: saved.id,
      usuario_id: saved.usuario_id,
      item_oferto: saved.item_oferto,
      item_desejado: saved.item_desejado,
      categoria: saved.categoria,
      created_at: saved.created_at,
    });

    return saved;
  }

  /**
   * Lista publicações com filtros de categoria/status e paginação.
   * @param query Filtros e paginação (categoria, status, page, limit).
   * @returns Objeto com data (lista) e meta (page, limit, total).
   */
  async findAll(query: ListPublicacoesDto) {
    const { categoria, status = 'disponivel', page = 1, limit = 20 } = query;

    const qb = this.repo.createQueryBuilder('p');
    if (categoria) qb.andWhere('p.categoria = :categoria', { categoria });
    qb.andWhere('p.status = :status', { status });

    const [data, total] = await qb
      .orderBy('p.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, meta: { page, limit, total } };
  }

  /**
   * Busca uma publicação pelo id.
   * @param id Id da publicação.
   * @returns A publicação encontrada.
   * @throws NotFoundException se a publicação não existir.
   */
  async findOne(id: string) {
    const pub = await this.repo.findOneBy({ id });
    if (!pub) throw new NotFoundException('Publicação não encontrada');
    return pub;
  }

  /**
   * Lista as publicações de um usuário, das mais recentes às antigas.
   * @param usuarioId Id do dono das publicações.
   * @returns Lista de publicações do usuário.
   */
  async findByUsuario(usuarioId: string) {
    return this.repo.find({
      where: { usuario_id: usuarioId },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Atualiza uma publicação (apenas o dono, só quando disponível) e emite
   * publicacao.atualizada.
   * @param id Id da publicação.
   * @param dto Campos a atualizar.
   * @param usuarioId Id do usuário autenticado.
   * @returns A publicação atualizada.
   * @throws ForbiddenException se o usuário não for o dono.
   * @throws BadRequestException se a publicação não estiver disponível.
   */
  async update(id: string, dto: UpdatePublicacaoDto, usuarioId: string) {
    const pub = await this.findOne(id);

    if (pub.usuario_id !== usuarioId) throw new ForbiddenException();

    if (pub.status !== PublicacaoStatus.DISPONIVEL) {
      throw new BadRequestException(
        'Publicação não pode ser editada no status atual',
      );
    }

    Object.assign(pub, dto);
    const saved = await this.repo.save(pub);

    this.rmqClient.emit('publicacao.atualizada', {
      id: saved.id,
      usuario_id: saved.usuario_id,
      item_oferto: saved.item_oferto,
      item_desejado: saved.item_desejado,
      categoria: saved.categoria,
      created_at: saved.created_at,
    });

    return saved;
  }

  /**
   * Remove (soft delete) uma publicação, marcando-a como removida e emitindo
   * publicacao.removida.
   * @param id Id da publicação.
   * @param usuarioId Id do usuário autenticado.
   * @returns Promise resolvida após a remoção.
   * @throws ForbiddenException se o usuário não for o dono.
   */
  async remove(id: string, usuarioId: string) {
    const pub = await this.findOne(id);

    if (pub.usuario_id !== usuarioId) throw new ForbiddenException();

    pub.status = PublicacaoStatus.REMOVIDO;
    await this.repo.save(pub);

    this.rmqClient.emit('publicacao.removida', {
      id: pub.id,
      usuario_id: pub.usuario_id,
    });
  }

  /**
   * Reage a match.aceito: move o par de negociando para trocado.
   * @param payload Ids das duas publicações do par.
   * @returns Promise resolvida após atualizar o status.
   */
  async handleMatchAceito(payload: {
    publicacao_a_id: string;
    publicacao_b_id: string;
  }) {
    await this.setStatusPar(
      payload.publicacao_a_id,
      payload.publicacao_b_id,
      PublicacaoStatus.NEGOCIANDO,
      PublicacaoStatus.TROCADO,
      'match.aceito',
    );
  }

  /**
   * Reage a match.encontrado: move o par de disponivel para negociando.
   * @param payload Ids das duas publicações do par.
   * @returns Promise resolvida após atualizar o status.
   */
  async handleMatchEncontrado(payload: {
    publicacao_a_id: string;
    publicacao_b_id: string;
  }) {
    await this.setStatusPar(
      payload.publicacao_a_id,
      payload.publicacao_b_id,
      PublicacaoStatus.DISPONIVEL,
      PublicacaoStatus.NEGOCIANDO,
      'match.encontrado',
    );
  }

  /**
   * Reage aos encerramentos (match.recusado/expirado/cancelado): devolve o par
   * de negociando para disponivel.
   * @param payload Ids das duas publicações do par.
   * @returns Promise resolvida após atualizar o status.
   */
  async handleMatchEncerrado(payload: {
    publicacao_a_id: string;
    publicacao_b_id: string;
  }) {
    await this.setStatusPar(
      payload.publicacao_a_id,
      payload.publicacao_b_id,
      PublicacaoStatus.NEGOCIANDO,
      PublicacaoStatus.DISPONIVEL,
      'match.encerrado',
    );
  }

  /**
   * Transição de status compartilhada pelos handlers de match: para cada
   * publicação do par que estiver no status 'de', altera para o status 'para'.
   * @param aId Id da primeira publicação.
   * @param bId Id da segunda publicação.
   * @param de Status esperado antes da transição.
   * @param para Novo status a aplicar.
   * @param origem Chave do evento de origem, usada nos logs.
   * @returns Promise resolvida após processar a transição.
   */
  private async setStatusPar(
    aId: string,
    bId: string,
    de: PublicacaoStatus,
    para: PublicacaoStatus,
    origem: string,
  ) {
    try {
      const [pubA, pubB] = await Promise.all([
        this.repo.findOneBy({ id: aId }),
        this.repo.findOneBy({ id: bId }),
      ]);

      if (!pubA || !pubB) {
        this.logger.error(
          `[${origem}] publicação não encontrada: ${aId} / ${bId}`,
        );
        return;
      }

      const alteradas = [pubA, pubB].filter((pub) => pub.status === de);

      if (!alteradas.length) {
        this.logger.warn(
          `[${origem}] nenhuma publicação em ${de} para ${aId} / ${bId}`,
        );
        return;
      }

      for (const pub of alteradas) pub.status = para;
      await this.repo.save(alteradas);

      this.logger.log(
        `[${origem}] ${alteradas.map((p) => p.id).join(', ')} ${de} -> ${para}`,
      );
    } catch (err) {
      this.logger.error(`[${origem}] erro ao processar evento`, err);
    }
  }
}

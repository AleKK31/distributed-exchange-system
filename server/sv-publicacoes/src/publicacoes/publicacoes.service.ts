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

  async findOne(id: string) {
    const pub = await this.repo.findOneBy({ id });
    if (!pub) throw new NotFoundException('Publicação não encontrada');
    return pub;
  }

  async findByUsuario(usuarioId: string) {
    return this.repo.find({
      where: { usuario_id: usuarioId },
      order: { created_at: 'DESC' },
    });
  }

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

  async handleMatchAceito(payload: {
    usuario_a: string;
    usuario_b: string;
    publicacao_a_id: string;
    publicacao_b_id: string;
  }) {
    try {
      const [pubA, pubB] = await Promise.all([
        this.repo.findOneBy({ id: payload.publicacao_a_id }),
        this.repo.findOneBy({ id: payload.publicacao_b_id }),
      ]);

      if (!pubA || !pubB) {
        this.logger.error(
          `[match.aceito] publicação não encontrada: ${JSON.stringify(payload)}`,
        );
        return;
      }

      pubA.status = PublicacaoStatus.TROCADO;
      pubB.status = PublicacaoStatus.TROCADO;
      await this.repo.save([pubA, pubB]);

      this.logger.log(
        `[match.aceito] publicações ${pubA.id} e ${pubB.id} marcadas como trocado`,
      );
    } catch (err) {
      this.logger.error('[match.aceito] erro ao processar evento', err);
    }
  }
}

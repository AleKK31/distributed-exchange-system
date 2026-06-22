import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ExpiracaoService } from '../rmq/expiracao.service';
import { RMQ_CLIENT } from '../rmq/rmq.client';
import {
  Proposta,
  PropostaStatus,
  RespostaStatus,
} from './entities/proposta.entity';

interface PublicacaoEventPayload {
  id: string;
  usuario_id: string;
  item_oferto: string;
  item_desejado: string;
  categoria: string;
  created_at: string;
}

interface PublicacaoRemovidaPayload {
  id: string;
  usuario_id: string;
}

@Injectable()
export class MatchService {
  private readonly logger = new Logger(MatchService.name);

  constructor(
    @InjectRepository(Proposta)
    private readonly repo: Repository<Proposta>,
    private readonly dataSource: DataSource,
    @Inject(RMQ_CLIENT)
    private readonly rmqClient: ClientProxy,
    @Inject(forwardRef(() => ExpiracaoService))
    private readonly expiracaoService: ExpiracaoService,
  ) {}

  async handlePublicacaoCriada(payload: PublicacaoEventPayload) {
    await this.procurarPar(payload, 'publicacao.criada');
  }

  async handlePublicacaoAtualizada(payload: PublicacaoEventPayload) {
    await this.procurarPar(payload, 'publicacao.atualizada');
  }

  async handlePublicacaoRemovida(payload: PublicacaoRemovidaPayload) {
    try {
      const proposta = await this.repo.findOne({
        where: [
          { publicacao_a_id: payload.id, status: PropostaStatus.PENDENTE },
          { publicacao_b_id: payload.id, status: PropostaStatus.PENDENTE },
        ],
      });

      if (!proposta) {
        this.logger.log(
          `[publicacao.removida] sem proposta pendente para ${payload.id}`,
        );
        return;
      }

      proposta.status = PropostaStatus.CANCELADO;
      const saved = await this.repo.save(proposta);

      this.rmqClient.emit('match.cancelado', this.toEventPayload(saved));

      this.logger.log(
        `[match.cancelado] proposta ${saved.id} cancelada pela remoção de ${payload.id}`,
      );
    } catch (err) {
      this.logger.error('[publicacao.removida] erro ao processar evento', err);
    }
  }

  private async procurarPar(payload: PublicacaoEventPayload, origem: string) {
    try {
      const origens = await this.dataSource.query<
        {
          usuario_id: string;
          item_oferto: string;
          item_desejado: string;
          status: string;
        }[]
      >(
        `SELECT usuario_id, item_oferto, item_desejado, status
         FROM publicacoes
         WHERE id = $1`,
        [payload.id],
      );

      const pub = origens[0];

      if (!pub || pub.status !== 'disponivel') {
        this.logger.log(`[${origem}] ${payload.id} indisponível para match`);
        return;
      }

      const emProposta = await this.repo.findOne({
        where: [
          { publicacao_a_id: payload.id, status: PropostaStatus.PENDENTE },
          { publicacao_b_id: payload.id, status: PropostaStatus.PENDENTE },
        ],
      });

      if (emProposta) {
        this.logger.log(
          `[${origem}] ${payload.id} já está em proposta pendente`,
        );
        return;
      }

      const candidato = await this.dataSource.query<
        { id: string; usuario_id: string }[]
      >(
        `SELECT p.id, p.usuario_id
         FROM publicacoes p
         WHERE p.status = 'disponivel'
           AND p.usuario_id <> $1
           AND LOWER(TRIM(p.item_oferto)) = LOWER(TRIM($2))
           AND LOWER(TRIM(p.item_desejado)) = LOWER(TRIM($3))
           AND p.id NOT IN (
             SELECT publicacao_a_id FROM propostas WHERE status = 'pendente'
             UNION
             SELECT publicacao_b_id FROM propostas WHERE status = 'pendente'
           )
         ORDER BY p.created_at ASC
         LIMIT 1`,
        [pub.usuario_id, pub.item_desejado, pub.item_oferto],
      );

      if (!candidato.length) {
        this.logger.log(`[${origem}] sem par para ${payload.id}`);
        return;
      }

      const par = candidato[0];

      const proposta = this.repo.create({
        publicacao_a_id: payload.id,
        publicacao_b_id: par.id,
        usuario_a_id: pub.usuario_id,
        usuario_b_id: par.usuario_id,
      });
      const saved = await this.repo.save(proposta);

      this.rmqClient.emit('match.encontrado', this.toEventPayload(saved));
      this.expiracaoService.agendar(saved.id);

      this.logger.log(
        `[match.encontrado] proposta ${saved.id} entre ${saved.publicacao_a_id} e ${saved.publicacao_b_id}`,
      );
    } catch (err) {
      this.logger.error(`[${origem}] erro ao processar evento`, err);
    }
  }

  async listarMinhas(userId: string) {
    return this.repo.find({
      where: [{ usuario_a_id: userId }, { usuario_b_id: userId }],
      order: { created_at: 'DESC' },
    });
  }

  async buscarParticipante(id: string, userId: string) {
    const proposta = await this.repo.findOneBy({ id });
    if (!proposta) throw new NotFoundException('Proposta não encontrada');
    if (proposta.usuario_a_id !== userId && proposta.usuario_b_id !== userId) {
      throw new ForbiddenException();
    }
    return proposta;
  }

  async responder(id: string, userId: string, resposta: RespostaStatus) {
    const proposta = await this.buscarParticipante(id, userId);

    if (proposta.status !== PropostaStatus.PENDENTE) {
      throw new BadRequestException('Proposta não está mais pendente');
    }

    if (proposta.usuario_a_id === userId) proposta.resposta_a = resposta;
    else proposta.resposta_b = resposta;

    if (resposta === RespostaStatus.RECUSADO) {
      proposta.status = PropostaStatus.RECUSADO;
      const saved = await this.repo.save(proposta);
      this.rmqClient.emit('match.recusado', this.toEventPayload(saved));
      return saved;
    }

    if (
      proposta.resposta_a === RespostaStatus.ACEITO &&
      proposta.resposta_b === RespostaStatus.ACEITO
    ) {
      proposta.status = PropostaStatus.ACEITO;
      const saved = await this.repo.save(proposta);
      this.rmqClient.emit('match.aceito', this.toEventPayload(saved));
      return saved;
    }

    return this.repo.save(proposta);
  }

  async expirarSePendente(matchId: string) {
    const proposta = await this.repo.findOneBy({ id: matchId });
    if (!proposta) return;
    if (proposta.status !== PropostaStatus.PENDENTE) return;

    proposta.status = PropostaStatus.EXPIRADO;
    const saved = await this.repo.save(proposta);
    this.rmqClient.emit('match.expirado', this.toEventPayload(saved));
    this.logger.log(`[match.expirado] proposta ${saved.id} expirada`);
  }

  private toEventPayload(p: Proposta) {
    return {
      match_id: p.id,
      usuario_a: p.usuario_a_id,
      usuario_b: p.usuario_b_id,
      publicacao_a_id: p.publicacao_a_id,
      publicacao_b_id: p.publicacao_b_id,
    };
  }
}

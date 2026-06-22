import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RMQ_CLIENT } from '../rmq/rmq.client';
import { Proposta } from './entities/proposta.entity';

interface PublicacaoCriadaPayload {
  id: string;
  usuario_id: string;
  item_oferto: string;
  item_desejado: string;
  categoria: string;
  created_at: string;
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
  ) {}

  async handlePublicacaoCriada(payload: PublicacaoCriadaPayload) {
    try {
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
        [payload.usuario_id, payload.item_desejado, payload.item_oferto],
      );

      if (!candidato.length) {
        this.logger.log(`[publicacao.criada] sem par para ${payload.id}`);
        return;
      }

      const par = candidato[0];

      const proposta = this.repo.create({
        publicacao_a_id: payload.id,
        publicacao_b_id: par.id,
        usuario_a_id: payload.usuario_id,
        usuario_b_id: par.usuario_id,
      });
      const saved = await this.repo.save(proposta);

      this.rmqClient.emit('match.encontrado', this.toEventPayload(saved));

      this.logger.log(
        `[match.encontrado] proposta ${saved.id} entre ${saved.publicacao_a_id} e ${saved.publicacao_b_id}`,
      );
    } catch (err) {
      this.logger.error('[publicacao.criada] erro ao processar evento', err);
    }
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

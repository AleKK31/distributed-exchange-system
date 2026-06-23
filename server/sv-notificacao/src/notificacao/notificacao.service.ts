import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Notificacao, TipoNotificacao } from './entities/notificacao.entity';

export interface MatchEventPayload {
  match_id: string;
  usuario_a: string;
  usuario_b: string;
  publicacao_a_id: string;
  publicacao_b_id: string;
}

@Injectable()
export class NotificacaoService {
  private readonly logger = new Logger(NotificacaoService.name);

  constructor(
    @InjectRepository(Notificacao)
    private readonly repo: Repository<Notificacao>,
    private readonly dataSource: DataSource,
  ) {}

  async criarParaMatch(
    tipo: TipoNotificacao,
    payload: MatchEventPayload,
  ): Promise<Notificacao[]> {
    try {
      const pubs = await this.dataSource.query<
        { id: string; item_oferto: string }[]
      >(`SELECT id, item_oferto FROM publicacoes WHERE id = ANY($1)`, [
        [payload.publicacao_a_id, payload.publicacao_b_id],
      ]);
      const users = await this.dataSource.query<{ id: string; name: string }[]>(
        `SELECT id, name FROM users WHERE id = ANY($1)`,
        [[payload.usuario_a, payload.usuario_b]],
      );

      const itemPorId = new Map(pubs.map((p) => [p.id, p.item_oferto]));
      const nomePorId = new Map(users.map((u) => [u.id, u.name]));

      const itemA = itemPorId.get(payload.publicacao_a_id);
      const itemB = itemPorId.get(payload.publicacao_b_id);
      const nomeA = nomePorId.get(payload.usuario_a);
      const nomeB = nomePorId.get(payload.usuario_b);

      const paraA = this.repo.create({
        usuario_id: payload.usuario_a,
        tipo,
        match_id: payload.match_id,
        publicacao_a_id: payload.publicacao_a_id,
        publicacao_b_id: payload.publicacao_b_id,
        mensagem: this.montarMensagem(tipo, itemA, itemB, nomeB),
      });
      const paraB = this.repo.create({
        usuario_id: payload.usuario_b,
        tipo,
        match_id: payload.match_id,
        publicacao_a_id: payload.publicacao_a_id,
        publicacao_b_id: payload.publicacao_b_id,
        mensagem: this.montarMensagem(tipo, itemB, itemA, nomeA),
      });

      const salvas = await this.repo.save([paraA, paraB]);
      this.logger.log(
        `[${tipo}] notificações criadas para match ${payload.match_id}`,
      );
      return salvas;
    } catch (err) {
      this.logger.error(`[${tipo}] erro ao criar notificações`, err);
      return [];
    }
  }

  async naoLidas(userId: string) {
    return this.repo.find({
      where: { usuario_id: userId, lida: false },
      order: { created_at: 'ASC' },
    });
  }

  private montarMensagem(
    tipo: TipoNotificacao,
    meuItem?: string,
    itemDele?: string,
    nomeDele?: string,
  ): string {
    const meu = meuItem ?? 'seu item';
    const dele = itemDele ?? 'o item do outro usuário';
    const nome = nomeDele ?? 'outro usuário';
    switch (tipo) {
      case TipoNotificacao.ENCONTRADO:
        return `Novo match: ${meu} pelo ${dele} de ${nome}.`;
      case TipoNotificacao.ACEITO:
        return `Troca confirmada: ${meu} por ${dele} com ${nome}.`;
      case TipoNotificacao.RECUSADO:
        return `Proposta recusada: ${meu} por ${dele}.`;
      case TipoNotificacao.EXPIRADO:
        return `Proposta expirada: ${meu} por ${dele}.`;
      case TipoNotificacao.CANCELADO:
        return `Troca cancelada: a publicação envolvida foi removida.`;
      default:
        return `Você tem uma nova notificação.`;
    }
  }
}

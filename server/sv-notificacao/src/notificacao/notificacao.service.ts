/**
 * Serviço de negócio de notificações. A partir dos eventos match.*, cria uma
 * notificação por destinatário (mensagem personalizada por usuário, lendo nome
 * e item das tabelas users/publicacoes), persiste-as e expõe consulta e
 * marcação de leitura.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 23/06/2026
 * Atualização: 07/07/2026
 */
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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

  /**
   * Cria e persiste as notificações de um evento de match: uma para cada
   * usuário do par, com mensagem invertida (o item de cada um em primeiro).
   * @param tipo Tipo da notificação (correspondente ao evento match.*).
   * @param payload Dados do match (ids de usuários e publicações).
   * @returns As notificações salvas (ou lista vazia em caso de erro).
   */
  async criarParaMatch(
    tipo: TipoNotificacao,
    payload: MatchEventPayload,
  ): Promise<Notificacao[]> {
    try {
      const pubs = await this.dataSource.query<
        { id: string; item_oferto: string }[]
      >(`SELECT id, item_oferto FROM publicacoes WHERE id = ANY($1::uuid[])`, [
        [payload.publicacao_a_id, payload.publicacao_b_id],
      ]);
      const users = await this.dataSource.query<{ id: string; name: string }[]>(
        `SELECT id, name FROM users WHERE id = ANY($1::uuid[])`,
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

  /**
   * Lista as notificações do usuário, das mais recentes às antigas.
   * @param userId Id do usuário autenticado.
   * @returns Lista de notificações do usuário.
   */
  async listarMinhas(userId: string) {
    return this.repo.find({
      where: { usuario_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Marca uma notificação do usuário como lida.
   * @param id Id da notificação.
   * @param userId Id do usuário autenticado.
   * @returns A notificação atualizada.
   * @throws NotFoundException se a notificação não existir.
   * @throws ForbiddenException se a notificação não for do usuário.
   */
  async marcarLida(id: string, userId: string) {
    const notificacao = await this.repo.findOneBy({ id });
    if (!notificacao) throw new NotFoundException('Notificação não encontrada');
    if (notificacao.usuario_id !== userId) throw new ForbiddenException();
    notificacao.lida = true;
    return this.repo.save(notificacao);
  }

  /**
   * Lista as notificações não lidas do usuário, das mais antigas às recentes
   * (usada no replay ao conectar o WebSocket).
   * @param userId Id do usuário autenticado.
   * @returns Lista de notificações não lidas.
   */
  async naoLidas(userId: string) {
    return this.repo.find({
      where: { usuario_id: userId, lida: false },
      order: { created_at: 'ASC' },
    });
  }

  /**
   * Monta a mensagem de uma notificação conforme o tipo, na perspectiva do
   * destinatário (com fallbacks quando item/nome não são encontrados).
   * @param tipo Tipo da notificação.
   * @param meuItem Item do próprio destinatário.
   * @param itemDele Item do outro usuário.
   * @param nomeDele Nome do outro usuário.
   * @returns Texto da mensagem.
   */
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
        return `Novo match: "${meu}" por "${dele}" de ${nome}.`;
      case TipoNotificacao.ACEITO:
        return `Troca confirmada: "${meu}" por "${dele}" com ${nome}.`;
      case TipoNotificacao.RECUSADO:
        return `Proposta recusada: "${meu}" por "${dele}".`;
      case TipoNotificacao.EXPIRADO:
        return `Proposta expirada: "${meu}" por "${dele}".`;
      case TipoNotificacao.CANCELADO:
        return `Troca cancelada: a publicação envolvida foi removida.`;
      default:
        return `Você tem uma nova notificação.`;
    }
  }
}

/**
 * Serviço de expiração de propostas via TTL + Dead Letter Exchange. Publica os
 * agendamentos numa fila com TTL; ao expirar, a mensagem cai na DLX e é
 * consumida aqui, disparando a expiração da proposta no MatchService.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 21/06/2026
 * Atualização: 07/07/2026
 */
import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { MatchService } from '../match/match.service';

const FILA_AGUARDANDO = 'match.aguardando';
const FILA_EXPIRACAO = 'match.expiracao';
const DLX = 'trocas.dlx';
const ROUTING_EXPIRACAO = 'match.expiracao';

@Injectable()
export class ExpiracaoService implements OnModuleInit {
  private readonly logger = new Logger(ExpiracaoService.name);
  private channel!: amqp.Channel;
  private ttl!: number;

  constructor(
    private readonly config: ConfigService,
    @Inject(forwardRef(() => MatchService))
    private readonly matchService: MatchService,
  ) {}

  /**
   * Inicializa a conexão/canal AMQP e declara a topologia de expiração (fila de
   * espera com TTL/DLX, exchange DLX e fila de expiração), começando a consumir.
   * @returns Promise resolvida quando o consumidor está ativo.
   */
  async onModuleInit() {
    const url = this.config.get<string>(
      'RABBITMQ_URL',
      'amqp://guest:guest@localhost:5672',
    );
    this.ttl = Number(this.config.get<string>('MATCH_TTL_MS', '180000'));

    const conn = await amqp.connect(url);
    this.channel = await conn.createChannel();

    await this.channel.assertExchange(DLX, 'direct', { durable: true });
    await this.channel.assertQueue(FILA_AGUARDANDO, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': DLX,
        'x-dead-letter-routing-key': ROUTING_EXPIRACAO,
      },
    });
    await this.channel.assertQueue(FILA_EXPIRACAO, { durable: true });
    await this.channel.bindQueue(FILA_EXPIRACAO, DLX, ROUTING_EXPIRACAO);

    await this.channel.consume(FILA_EXPIRACAO, (msg) => {
      if (!msg) return;
      void this.processarExpiracao(msg);
    });
  }

  /**
   * Processa uma mensagem que caiu na fila de expiração, expirando a proposta
   * correspondente, e confirma a mensagem.
   * @param msg Mensagem AMQP com o match_id.
   * @returns Promise resolvida após processar e confirmar a mensagem.
   */
  private async processarExpiracao(msg: amqp.ConsumeMessage) {
    try {
      const { match_id } = JSON.parse(msg.content.toString()) as {
        match_id: string;
      };
      await this.matchService.expirarSePendente(match_id);
      this.channel.ack(msg);
    } catch (err) {
      this.logger.error('[match.expiracao] erro ao processar', err);
      this.channel.ack(msg);
    }
  }

  /**
   * Agenda a expiração de uma proposta, enfileirando-a na fila de espera com o
   * TTL configurado.
   * @param matchId Id da proposta a expirar após o TTL.
   */
  agendar(matchId: string) {
    this.channel.sendToQueue(
      FILA_AGUARDANDO,
      Buffer.from(JSON.stringify({ match_id: matchId })),
      { expiration: String(this.ttl), persistent: true },
    );
  }
}

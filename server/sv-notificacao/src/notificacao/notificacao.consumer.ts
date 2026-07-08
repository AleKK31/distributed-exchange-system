/**
 * Consumidor AMQP do sv-notificacao. Escuta os cinco eventos match.* no
 * RabbitMQ, cria as notificações via service, emite-as em tempo real pelo
 * gateway WebSocket e confirma (ack manual) cada mensagem processada.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 23/06/2026
 * Atualização: 07/07/2026
 */
import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Channel, Message } from 'amqplib';
import { TipoNotificacao } from './entities/notificacao.entity';
import { NotificacaoGateway } from './notificacao.gateway';
import { MatchEventPayload, NotificacaoService } from './notificacao.service';

@Controller()
export class NotificacaoConsumer {
  constructor(
    private readonly service: NotificacaoService,
    private readonly gateway: NotificacaoGateway,
  ) {}

  /**
   * Trata match.encontrado gerando as notificações do tipo ENCONTRADO.
   * @param payload Dados do match.
   * @param context Contexto RMQ para ack manual.
   * @returns Promise resolvida após processar e confirmar a mensagem.
   */
  @EventPattern('match.encontrado')
  async handleEncontrado(
    @Payload() payload: MatchEventPayload,
    @Ctx() context: RmqContext,
  ) {
    await this.processar(TipoNotificacao.ENCONTRADO, payload, context);
  }

  /**
   * Trata match.aceito gerando as notificações do tipo ACEITO.
   * @param payload Dados do match.
   * @param context Contexto RMQ para ack manual.
   * @returns Promise resolvida após processar e confirmar a mensagem.
   */
  @EventPattern('match.aceito')
  async handleAceito(
    @Payload() payload: MatchEventPayload,
    @Ctx() context: RmqContext,
  ) {
    await this.processar(TipoNotificacao.ACEITO, payload, context);
  }

  /**
   * Trata match.recusado gerando as notificações do tipo RECUSADO.
   * @param payload Dados do match.
   * @param context Contexto RMQ para ack manual.
   * @returns Promise resolvida após processar e confirmar a mensagem.
   */
  @EventPattern('match.recusado')
  async handleRecusado(
    @Payload() payload: MatchEventPayload,
    @Ctx() context: RmqContext,
  ) {
    await this.processar(TipoNotificacao.RECUSADO, payload, context);
  }

  /**
   * Trata match.expirado gerando as notificações do tipo EXPIRADO.
   * @param payload Dados do match.
   * @param context Contexto RMQ para ack manual.
   * @returns Promise resolvida após processar e confirmar a mensagem.
   */
  @EventPattern('match.expirado')
  async handleExpirado(
    @Payload() payload: MatchEventPayload,
    @Ctx() context: RmqContext,
  ) {
    await this.processar(TipoNotificacao.EXPIRADO, payload, context);
  }

  /**
   * Trata match.cancelado gerando as notificações do tipo CANCELADO.
   * @param payload Dados do match.
   * @param context Contexto RMQ para ack manual.
   * @returns Promise resolvida após processar e confirmar a mensagem.
   */
  @EventPattern('match.cancelado')
  async handleCancelado(
    @Payload() payload: MatchEventPayload,
    @Ctx() context: RmqContext,
  ) {
    await this.processar(TipoNotificacao.CANCELADO, payload, context);
  }

  /**
   * Fluxo comum dos handlers: cria as notificações do tipo, emite-as em tempo
   * real pelo gateway e confirma a mensagem (ack) ao final.
   * @param tipo Tipo da notificação a gerar.
   * @param payload Dados do match.
   * @param context Contexto RMQ para ack manual.
   * @returns Promise resolvida após processar e confirmar a mensagem.
   */
  private async processar(
    tipo: TipoNotificacao,
    payload: MatchEventPayload,
    context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const originalMsg = context.getMessage() as Message;
    try {
      const salvas = await this.service.criarParaMatch(tipo, payload);
      for (const n of salvas) this.gateway.emitirParaUsuario(n.usuario_id, n);
    } finally {
      channel.ack(originalMsg);
    }
  }
}

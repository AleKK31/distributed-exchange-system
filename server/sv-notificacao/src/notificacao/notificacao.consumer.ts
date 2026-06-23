import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Channel, Message } from 'amqplib';
import { TipoNotificacao } from './entities/notificacao.entity';
import { MatchEventPayload, NotificacaoService } from './notificacao.service';

@Controller()
export class NotificacaoConsumer {
  constructor(private readonly service: NotificacaoService) {}

  @EventPattern('match.encontrado')
  async handleEncontrado(
    @Payload() payload: MatchEventPayload,
    @Ctx() context: RmqContext,
  ) {
    await this.processar(TipoNotificacao.ENCONTRADO, payload, context);
  }

  @EventPattern('match.aceito')
  async handleAceito(
    @Payload() payload: MatchEventPayload,
    @Ctx() context: RmqContext,
  ) {
    await this.processar(TipoNotificacao.ACEITO, payload, context);
  }

  @EventPattern('match.recusado')
  async handleRecusado(
    @Payload() payload: MatchEventPayload,
    @Ctx() context: RmqContext,
  ) {
    await this.processar(TipoNotificacao.RECUSADO, payload, context);
  }

  @EventPattern('match.expirado')
  async handleExpirado(
    @Payload() payload: MatchEventPayload,
    @Ctx() context: RmqContext,
  ) {
    await this.processar(TipoNotificacao.EXPIRADO, payload, context);
  }

  @EventPattern('match.cancelado')
  async handleCancelado(
    @Payload() payload: MatchEventPayload,
    @Ctx() context: RmqContext,
  ) {
    await this.processar(TipoNotificacao.CANCELADO, payload, context);
  }

  private async processar(
    tipo: TipoNotificacao,
    payload: MatchEventPayload,
    context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const originalMsg = context.getMessage() as Message;
    try {
      await this.service.criarParaMatch(tipo, payload);
    } finally {
      channel.ack(originalMsg);
    }
  }
}

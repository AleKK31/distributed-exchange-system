import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Channel, Message } from 'amqplib';
import { PublicacoesService } from './publicacoes.service';

interface MatchAceitoPayload {
  usuario_a: string;
  usuario_b: string;
  publicacao_a_id: string;
  publicacao_b_id: string;
}

@Controller()
export class PublicacoesConsumer {
  constructor(private readonly service: PublicacoesService) {}

  @EventPattern('match.aceito')
  async handleMatchAceito(
    @Payload() payload: MatchAceitoPayload,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const originalMsg = context.getMessage() as Message;
    try {
      await this.service.handleMatchAceito(payload);
    } finally {
      channel.ack(originalMsg);
    }
  }

  @EventPattern('match.encontrado')
  async handleMatchEncontrado(
    @Payload() payload: MatchAceitoPayload,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const originalMsg = context.getMessage() as Message;
    try {
      await this.service.handleMatchEncontrado(payload);
    } finally {
      channel.ack(originalMsg);
    }
  }

  @EventPattern('match.recusado')
  async handleMatchRecusado(
    @Payload() payload: MatchAceitoPayload,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const originalMsg = context.getMessage() as Message;
    try {
      await this.service.handleMatchEncerrado(payload);
    } finally {
      channel.ack(originalMsg);
    }
  }

  @EventPattern('match.expirado')
  async handleMatchExpirado(
    @Payload() payload: MatchAceitoPayload,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const originalMsg = context.getMessage() as Message;
    try {
      await this.service.handleMatchEncerrado(payload);
    } finally {
      channel.ack(originalMsg);
    }
  }

  @EventPattern('match.cancelado')
  async handleMatchCancelado(
    @Payload() payload: MatchAceitoPayload,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const originalMsg = context.getMessage() as Message;
    try {
      await this.service.handleMatchEncerrado(payload);
    } finally {
      channel.ack(originalMsg);
    }
  }
}

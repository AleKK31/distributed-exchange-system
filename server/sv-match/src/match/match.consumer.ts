import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Channel, Message } from 'amqplib';
import { MatchService } from './match.service';

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

@Controller()
export class MatchConsumer {
  constructor(private readonly service: MatchService) {}

  @EventPattern('publicacao.criada')
  async handlePublicacaoCriada(
    @Payload() payload: PublicacaoEventPayload,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const originalMsg = context.getMessage() as Message;
    try {
      await this.service.handlePublicacaoCriada(payload);
    } finally {
      channel.ack(originalMsg);
    }
  }

  @EventPattern('publicacao.atualizada')
  async handlePublicacaoAtualizada(
    @Payload() payload: PublicacaoEventPayload,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const originalMsg = context.getMessage() as Message;
    try {
      await this.service.handlePublicacaoAtualizada(payload);
    } finally {
      channel.ack(originalMsg);
    }
  }

  @EventPattern('publicacao.removida')
  async handlePublicacaoRemovida(
    @Payload() payload: PublicacaoRemovidaPayload,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const originalMsg = context.getMessage() as Message;
    try {
      await this.service.handlePublicacaoRemovida(payload);
    } finally {
      channel.ack(originalMsg);
    }
  }
}

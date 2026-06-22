import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Channel, Message } from 'amqplib';
import { MatchService } from './match.service';

interface PublicacaoCriadaPayload {
  id: string;
  usuario_id: string;
  item_oferto: string;
  item_desejado: string;
  categoria: string;
  created_at: string;
}

@Controller()
export class MatchConsumer {
  constructor(private readonly service: MatchService) {}

  @EventPattern('publicacao.criada')
  async handlePublicacaoCriada(
    @Payload() payload: PublicacaoCriadaPayload,
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
}

/**
 * Consumidor AMQP do sv-match. Escuta os eventos publicacao.* no RabbitMQ e
 * delega ao service a busca de pares e o cancelamento de propostas,
 * confirmando (ack manual) cada mensagem processada.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 21/06/2026
 * Atualização: 07/07/2026
 */
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

  /**
   * Trata publicacao.criada, disparando a busca por par compatível.
   * @param payload Dados da publicação criada.
   * @param context Contexto RMQ para ack manual.
   * @returns Promise resolvida após processar e confirmar a mensagem.
   */
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

  /**
   * Trata publicacao.atualizada, refazendo a busca por par compatível.
   * @param payload Dados da publicação atualizada.
   * @param context Contexto RMQ para ack manual.
   * @returns Promise resolvida após processar e confirmar a mensagem.
   */
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

  /**
   * Trata publicacao.removida, cancelando a proposta pendente da publicação.
   * @param payload Identificação da publicação removida.
   * @param context Contexto RMQ para ack manual.
   * @returns Promise resolvida após processar e confirmar a mensagem.
   */
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

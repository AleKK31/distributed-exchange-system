/**
 * Consumidor AMQP do sv-publicacoes. Escuta os eventos match.* no RabbitMQ e
 * delega ao service a atualização de status das publicações, confirmando
 * (ack manual) cada mensagem processada.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 20/06/2026
 * Atualização: 07/07/2026
 */
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

  /**
   * Trata match.aceito, marcando o par como trocado.
   * @param payload Dados do match (ids das publicações e usuários).
   * @param context Contexto RMQ para ack manual.
   * @returns Promise resolvida após processar e confirmar a mensagem.
   */
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

  /**
   * Trata match.encontrado, marcando o par como negociando.
   * @param payload Dados do match (ids das publicações e usuários).
   * @param context Contexto RMQ para ack manual.
   * @returns Promise resolvida após processar e confirmar a mensagem.
   */
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

  /**
   * Trata match.recusado, devolvendo o par para disponivel.
   * @param payload Dados do match (ids das publicações e usuários).
   * @param context Contexto RMQ para ack manual.
   * @returns Promise resolvida após processar e confirmar a mensagem.
   */
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

  /**
   * Trata match.expirado, devolvendo o par para disponivel.
   * @param payload Dados do match (ids das publicações e usuários).
   * @param context Contexto RMQ para ack manual.
   * @returns Promise resolvida após processar e confirmar a mensagem.
   */
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

  /**
   * Trata match.cancelado, devolvendo o par para disponivel.
   * @param payload Dados do match (ids das publicações e usuários).
   * @param context Contexto RMQ para ack manual.
   * @returns Promise resolvida após processar e confirmar a mensagem.
   */
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

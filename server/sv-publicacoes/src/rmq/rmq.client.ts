/**
 * Módulo do cliente RabbitMQ (produtor). Registra o ClientProxy (token
 * RMQ_CLIENT) usado para emitir os eventos publicacao.* na exchange topic.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 20/06/2026
 * Atualização: 07/07/2026
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

export const RMQ_CLIENT = 'RMQ_CLIENT';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: RMQ_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              config.get<string>(
                'RABBITMQ_URL',
                'amqp://guest:guest@localhost:5672',
              ),
            ],
            queue: 'publicacoes_producer_queue',
            exchange: config.get<string>('RABBITMQ_EXCHANGE', 'trocas.topic'),
            exchangeType: 'topic',
            wildcards: true,
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RmqClientModule {}

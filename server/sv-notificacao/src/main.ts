/**
 * Ponto de entrada do sv-notificacao. Cria a aplicação NestJS, habilita CORS,
 * conecta o microsserviço RabbitMQ (consumo de eventos match.*), habilita a
 * validação global de DTOs e publica a documentação Swagger em /docs.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 20/06/2026
 * Atualização: 07/07/2026
 */
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * Inicializa a aplicação HTTP/WebSocket e o microsserviço AMQP, e sobe o
 * servidor na porta configurada.
 * @returns Promise resolvida quando o servidor está ouvindo.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672'],
      queue: 'notificacao_consumer_queue',
      exchange: process.env.RABBITMQ_EXCHANGE ?? 'trocas.topic',
      exchangeType: 'topic',
      wildcards: true,
      queueOptions: { durable: true },
      noAck: false,
      prefetchCount: 1,
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('sv-notificacao')
    .setDescription('Serviço de notificação de trocas')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  await app.startAllMicroservices();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Swagger: http://localhost:${port}/docs`);
}
bootstrap();

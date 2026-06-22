import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672'],
      queue: 'match_consumer_queue',
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
    .setTitle('sv-match')
    .setDescription('Serviço de match de trocas')
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

/**
 * Módulo de publicações: registra a entidade, o controller HTTP, o consumidor
 * AMQP e o service, importando os módulos de autenticação e do cliente RMQ.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 20/06/2026
 * Atualização: 07/07/2026
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { RmqClientModule } from '../rmq/rmq.client';
import { Publicacao } from './entities/publicacao.entity';
import { PublicacoesConsumer } from './publicacoes.consumer';
import { PublicacoesController } from './publicacoes.controller';
import { PublicacoesService } from './publicacoes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Publicacao]),
    AuthModule,
    RmqClientModule,
  ],
  controllers: [PublicacoesController, PublicacoesConsumer],
  providers: [PublicacoesService],
})
export class PublicacoesModule {}

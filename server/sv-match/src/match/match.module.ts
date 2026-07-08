/**
 * Módulo de match: registra a entidade Proposta, o controller HTTP, o
 * consumidor AMQP, o service e o serviço de expiração, importando os módulos de
 * autenticação e do cliente RMQ.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 21/06/2026
 * Atualização: 07/07/2026
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ExpiracaoService } from '../rmq/expiracao.service';
import { RmqClientModule } from '../rmq/rmq.client';
import { Proposta } from './entities/proposta.entity';
import { MatchConsumer } from './match.consumer';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';

@Module({
  imports: [TypeOrmModule.forFeature([Proposta]), AuthModule, RmqClientModule],
  controllers: [MatchConsumer, MatchController],
  providers: [MatchService, ExpiracaoService],
})
export class MatchModule {}

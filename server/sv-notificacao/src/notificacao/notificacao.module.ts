/**
 * Módulo de notificação: registra a entidade, o consumidor AMQP, o controller
 * HTTP, o service e o gateway WebSocket, importando o módulo de autenticação.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 23/06/2026
 * Atualização: 07/07/2026
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Notificacao } from './entities/notificacao.entity';
import { NotificacaoConsumer } from './notificacao.consumer';
import { NotificacaoController } from './notificacao.controller';
import { NotificacaoGateway } from './notificacao.gateway';
import { NotificacaoService } from './notificacao.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notificacao]), AuthModule],
  controllers: [NotificacaoConsumer, NotificacaoController],
  providers: [NotificacaoService, NotificacaoGateway],
})
export class NotificacaoModule {}

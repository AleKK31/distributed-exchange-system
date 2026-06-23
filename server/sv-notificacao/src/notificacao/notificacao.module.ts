import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Notificacao } from './entities/notificacao.entity';
import { NotificacaoConsumer } from './notificacao.consumer';
import { NotificacaoGateway } from './notificacao.gateway';
import { NotificacaoService } from './notificacao.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notificacao]), AuthModule],
  controllers: [NotificacaoConsumer],
  providers: [NotificacaoService, NotificacaoGateway],
})
export class NotificacaoModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Notificacao } from './entities/notificacao.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notificacao]), AuthModule],
  controllers: [],
  providers: [],
})
export class NotificacaoModule {}

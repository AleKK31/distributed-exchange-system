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

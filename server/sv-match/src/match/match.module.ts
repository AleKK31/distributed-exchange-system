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

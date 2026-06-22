import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { RmqClientModule } from '../rmq/rmq.client';
import { Proposta } from './entities/proposta.entity';
import { MatchConsumer } from './match.consumer';
import { MatchService } from './match.service';

@Module({
  imports: [TypeOrmModule.forFeature([Proposta]), AuthModule, RmqClientModule],
  controllers: [MatchConsumer],
  providers: [MatchService],
})
export class MatchModule {}

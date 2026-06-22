import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { RmqClientModule } from '../rmq/rmq.client';
import { Proposta } from './entities/proposta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Proposta]), AuthModule, RmqClientModule],
  controllers: [],
  providers: [],
})
export class MatchModule {}

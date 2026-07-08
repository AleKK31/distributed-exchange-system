/**
 * Módulo raiz do sv-match. Configura o acesso ao PostgreSQL via TypeORM
 * (com synchronize) e agrega o módulo de match.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 20/06/2026
 * Atualização: 07/07/2026
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proposta } from './match/entities/proposta.entity';
import { MatchModule } from './match/match.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST ?? 'localhost',
      port: Number(process.env.DATABASE_PORT ?? 5433),
      username: process.env.DATABASE_USER ?? 'admin',
      password: process.env.DATABASE_PASSWORD ?? 'admin',
      database: process.env.DATABASE_NAME ?? 'exchange_db',
      entities: [Proposta],
      synchronize: true,
    }),
    MatchModule,
  ],
})
export class AppModule {}

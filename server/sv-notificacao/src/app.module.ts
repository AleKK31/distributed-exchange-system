/**
 * Módulo raiz do sv-notificacao. Configura o acesso ao PostgreSQL via TypeORM
 * (com synchronize) e agrega o módulo de notificação.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 20/06/2026
 * Atualização: 07/07/2026
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notificacao } from './notificacao/entities/notificacao.entity';
import { NotificacaoModule } from './notificacao/notificacao.module';

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
      entities: [Notificacao],
      synchronize: true,
    }),
    NotificacaoModule,
  ],
})
export class AppModule {}

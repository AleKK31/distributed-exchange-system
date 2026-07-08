/**
 * Módulo de autenticação. Configura o JwtModule (segredo e expiração) e a
 * estratégia JWT do Passport, exportando o JwtModule.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 21/06/2026
 * Atualização: 07/07/2026
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'troca_secret_dev',
      signOptions: {
        expiresIn: Number(process.env.JWT_EXPIRES_IN) || 3600,
      },
    }),
  ],
  providers: [JwtStrategy],
  exports: [JwtModule],
})
export class AuthModule {}

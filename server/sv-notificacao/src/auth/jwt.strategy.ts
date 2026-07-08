/**
 * Estratégia JWT do Passport. Extrai o token do cabeçalho Bearer, valida a
 * assinatura/expiração e mapeia o payload para o objeto req.user.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 23/06/2026
 * Atualização: 07/07/2026
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'troca_secret_dev'),
    });
  }

  /**
   * Converte o payload do token no objeto exposto como req.user.
   * @param payload Conteúdo do JWT ({ sub, email }).
   * @returns Objeto { id, email } anexado à requisição.
   */
  validate(payload: { sub: string; email: string }) {
    return { id: payload.sub, email: payload.email };
  }
}

import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PublicacoesService } from './publicacoes.service';

interface MatchAceitoPayload {
  usuario_a: string;
  usuario_b: string;
  publicacao_a_id: string;
  publicacao_b_id: string;
}

@Controller()
export class PublicacoesConsumer {
  constructor(private readonly service: PublicacoesService) {}

  @EventPattern('match.aceito')
  async handleMatchAceito(@Payload() payload: MatchAceitoPayload) {
    await this.service.handleMatchAceito(payload);
  }
}

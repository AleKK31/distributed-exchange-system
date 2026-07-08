/**
 * Gateway WebSocket (socket.io) de notificações. Autentica o cliente por JWT no
 * handshake, coloca-o na sala user:<id>, faz o replay das notificações não
 * lidas ao conectar e permite emitir notificações em tempo real por usuário.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 23/06/2026
 * Atualização: 07/07/2026
 */
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Notificacao } from './entities/notificacao.entity';
import { NotificacaoService } from './notificacao.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificacaoGateway implements OnGatewayConnection {
  private readonly logger = new Logger(NotificacaoGateway.name);

  @WebSocketServer() server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly service: NotificacaoService,
  ) {}

  /**
   * Trata a conexão de um cliente: valida o token JWT do handshake, entra na
   * sala do usuário e reenvia as notificações não lidas. Desconecta se o token
   * for inválido.
   * @param client Socket recém-conectado.
   * @returns Promise resolvida após o setup da conexão.
   */
  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ??
        (client.handshake.headers.authorization as string) ??
        '';
      const limpo = token.replace(/^Bearer\s+/i, '');
      const payload = this.jwt.verify<{ sub: string }>(limpo);
      const userId = payload.sub;

      await client.join(`user:${userId}`);

      const naoLidas = await this.service.naoLidas(userId);
      for (const n of naoLidas) client.emit('notificacao', n);

      this.logger.log(`socket conectado para usuário ${userId}`);
    } catch {
      client.disconnect();
    }
  }

  /**
   * Emite uma notificação em tempo real para a sala do usuário.
   * @param userId Id do usuário destinatário.
   * @param notificacao Notificação a enviar.
   */
  emitirParaUsuario(userId: string, notificacao: Notificacao) {
    this.server.to(`user:${userId}`).emit('notificacao', notificacao);
  }
}

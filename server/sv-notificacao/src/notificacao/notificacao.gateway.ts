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

  emitirParaUsuario(userId: string, notificacao: Notificacao) {
    this.server.to(`user:${userId}`).emit('notificacao', notificacao);
  }
}

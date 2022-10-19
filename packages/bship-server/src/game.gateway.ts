import { Inject, Logger, LoggerService } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { GameMessageType } from 'bship-contracts';
import { urlAlphabet } from 'nanoid';
import { IncomingMessage } from 'node:http';
import url from 'node:url';
import { Server, WebSocket } from 'ws';
import { ClientPairingService } from './client-pairing.service';
import { GameContext } from './game-context';

interface GameWebSocket extends WebSocket {
  connectionId: string | undefined;
}

@WebSocketGateway({
  path: '/game',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  private readonly clients = new Map<string, GameWebSocket>();

  private readonly games: GameContext[] = [];

  constructor(
    private clientPairingService: ClientPairingService,
    @Inject(Logger) private readonly logger: LoggerService
  ) {}

  @SubscribeMessage(GameMessageType.CreateGame)
  handleCreateGame(@MessageBody() data: any, @ConnectedSocket() client: GameWebSocket): any {
    if (!client.connectionId) {
      return;
    }

    const gameContext = this.clientPairingService.tryPairClient({
      connectionId: client.connectionId,
      socket: client,
      fleet: data.fleet,
    });

    if (!gameContext) {
      return { event: GameMessageType.WaitForOpponent };
    }

    this.games.push(gameContext);
  }

  @SubscribeMessage('chat')
  handleChatEvent(@MessageBody() data: any): any {
    console.log(data);

    return data;
  }

  handleConnection(client: GameWebSocket, req: IncomingMessage): void {
    const { query } = url.parse(req.url ?? '', true);
    if (!query?.id) {
      this.logger.error('Client opened connection with missing ID', GameGateway.name);
      return client?.close();
    }
    if (!this.validWebsocketId(query.id)) {
      this.logger.error('Client opened connection with incorrectly formated ID', GameGateway.name);
      return client?.close();
    }
    if (this.clients.has(query.id)) {
      this.logger.error(
        'Client opened connection with already existing ID (duplicate)',
        GameGateway.name
      );
      return client?.close();
    }

    client.connectionId = query.id;
    this.clients.set(query.id, client);
    this.logger.log(`New client connected: ${query.id}`, GameGateway.name);
  }

  handleDisconnect(client: GameWebSocket): void {
    if (client.connectionId) {
      this.clients.delete(client.connectionId);
    }
  }

  private validWebsocketId(websocketId: string | string[]): websocketId is string {
    if (typeof websocketId !== 'string') {
      return false;
    }

    return websocketId.length >= 21 && [...websocketId].every((ch) => urlAlphabet.includes(ch));
  }
}

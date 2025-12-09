import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  merchantId?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>(); // userId -> Set of socket IDs
  private merchantSockets = new Map<string, Set<string>>(); // merchantId -> Set of socket IDs

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('jwt.secret'),
      });

      client.userId = payload.sub;

      // Add to user sockets map
      if (!this.userSockets.has(client.userId)) {
        this.userSockets.set(client.userId, new Set());
      }
      this.userSockets.get(client.userId)!.add(client.id);

      // Join user-specific room
      client.join(`user:${client.userId}`);

      console.log(`Client connected: ${client.id}, userId: ${client.userId}`);
    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      const userSocketSet = this.userSockets.get(client.userId);
      if (userSocketSet) {
        userSocketSet.delete(client.id);
        if (userSocketSet.size === 0) {
          this.userSockets.delete(client.userId);
        }
      }
    }

    if (client.merchantId) {
      const merchantSocketSet = this.merchantSockets.get(client.merchantId);
      if (merchantSocketSet) {
        merchantSocketSet.delete(client.id);
        if (merchantSocketSet.size === 0) {
          this.merchantSockets.delete(client.merchantId);
        }
      }
    }

    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_merchant')
  handleJoinMerchant(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { merchantId: string },
  ) {
    client.merchantId = data.merchantId;

    if (!this.merchantSockets.has(data.merchantId)) {
      this.merchantSockets.set(data.merchantId, new Set());
    }
    this.merchantSockets.get(data.merchantId)!.add(client.id);

    client.join(`merchant:${data.merchantId}`);

    console.log(`Client ${client.id} joined merchant room: ${data.merchantId}`);
  }

  // Send notification to a specific user
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  // Send notification to a merchant
  sendToMerchant(merchantId: string, event: string, data: any) {
    this.server.to(`merchant:${merchantId}`).emit(event, data);
  }

  // Broadcast to all connected clients
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Send new order notification to merchant
  notifyMerchantNewOrder(merchantId: string, order: any) {
    this.sendToMerchant(merchantId, 'new_order', order);
  }

  // Send order status update to customer
  notifyOrderStatusUpdate(userId: string, order: any) {
    this.sendToUser(userId, 'order_status_update', order);
  }
}

import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { DefaultEventsMap, Server, Socket } from 'socket.io';
import { MeetingService } from 'src/meeting/meeting.service';
import { TokenPayLoad } from 'src/types/tokenPayload';

interface AuthenticatedSocketData {
  user?: {
    id: string;
    email: string;
  };
}

type AppSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  AuthenticatedSocketData
>;

type AppServer = Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  AuthenticatedSocketData
>;

function getCookieValue(cookieHeader: string | undefined, name: string) {
  if (!cookieHeader) return undefined;

  return cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');
}
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL?.split(','),
    credentials: true,
  },
})
export class WebrtcGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: AppServer;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly meetingService: MeetingService,
  ) {}

  afterInit(server: AppServer) {
    server.use((socket: AppSocket, next) => {
      try {
        const rawToken = getCookieValue(
          socket.handshake.headers.cookie,
          'accessToken',
        );
        if (!rawToken) {
          return next(new UnauthorizedException('No token provided'));
        }
        const token = decodeURIComponent(rawToken);
        const userPayload: TokenPayLoad = this.jwtService.verify(token, {
          secret: this.configService.get<string>('ACCESS_SECRET'),
        });

        if (!userPayload) {
          return next(new UnauthorizedException('Invalid token'));
        }
        socket.data.user = {
          id: userPayload.id,
          email: userPayload.email,
        };
        return next();
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          return next(error);
        }
        return next(
          new WsException('Authentication error in socket initialization'),
        );
      }
    });
  }

  handleConnection(client: AppSocket) {
    console.log(
      'client connected to socket = ',
      client.data.user?.email,
      'having id = ',
      client.data.user?.id,
    );
    client.on('disconnecting', () => {
      const user = client.data.user;
      for (const roomId of client.rooms) {
        if (roomId === client.id) {
          continue;
        }
        client.to(roomId).emit('user-left', {
          socketId: client.id,
          userId: user?.id,
        });
      }
    });
  }

  handleDisconnect(client: AppSocket) {
    console.log(
      'client disconnected from socket = ',
      client.data.user?.email,
      'having id = ',
      client.data.user?.id,
    );
  }

  @SubscribeMessage('join-meeting')
  async handleJoinMeeting(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: AppSocket,
  ) {
    try {
      const user = client.data.user;
      if (!roomId) {
        throw new BadRequestException(
          'Room ID is required to join the meeting',
        );
      }
      if (!user) {
        throw new UnauthorizedException('User not authenticated');
      }
      const validateMeetingStatus =
        await this.meetingService.ValidateJoinMeeting(roomId, user.id);

      if (!validateMeetingStatus || !validateMeetingStatus.isValid) {
        throw new BadRequestException('Invalid meeting or user');
      }
      const usersInRoom = this.server.sockets.adapter.rooms.get(roomId);
      if (usersInRoom && usersInRoom.size >= 2) {
        throw new BadRequestException('Meeting room is full');
      }
      const existingSocketIds = usersInRoom ? [...usersInRoom] : [];
      if (existingSocketIds.includes(client.id)) {
        throw new BadRequestException('User is already in the room');
      }

      await client.join(roomId);

      await this.meetingService.markUserJoined(roomId, user.id);

      client.emit('room-users', {
        roomId,
        user: existingSocketIds,
      });

      client.to(roomId).emit('user-joined', {
        socketId: client.id,
        user: {
          id: user.id,
          email: user.email,
        },
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new WsException('Unable to join the meeting');
    }
  }

  @SubscribeMessage('webrtc-offer')
  handleOffer(
    @MessageBody()
    data: {
      roomId: string;
      targetSocketId: string;
      offer: RTCSessionDescriptionInit;
    },
    @ConnectedSocket() client: AppSocket,
  ) {
    try {
      if (!data.roomId || !data.offer || !data.targetSocketId) {
        throw new WsException(
          'Room ID, target socket ID, and offer are required',
        );
      }
      if (!client.rooms.has(data.roomId)) {
        throw new WsException('You have not joined this meeting');
      }
      const targetSocket = this.server.sockets.sockets.get(data.targetSocketId);

      if (!targetSocket) {
        throw new WsException('Target participant is not connected');
      }
      if (!targetSocket.rooms.has(data.roomId)) {
        throw new WsException('Target participant is not in this meeting');
      }
      this.server.to(data.targetSocketId).emit('webrtc-offer', {
        fromSocketId: client.id,
        offer: data.offer,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new WsException('An error occured while sending offer');
    }
  }

  @SubscribeMessage('webrtc-answer')
  handleAnswer(
    @MessageBody()
    data: {
      roomId: string;
      targetSocketId: string;
      answer: RTCSessionDescriptionInit;
    },
    @ConnectedSocket() client: AppSocket,
  ) {
    if (!data.roomId || !data.targetSocketId || !data.answer) {
      throw new WsException(
        'Room ID, target socket ID, and answer are required',
      );
    }

    if (!client.rooms.has(data.roomId)) {
      throw new WsException('You have not joined this meeting');
    }

    const targetSocket = this.server.sockets.sockets.get(data.targetSocketId);

    if (!targetSocket) {
      throw new WsException('Target participant is not connected');
    }

    if (!targetSocket.rooms.has(data.roomId)) {
      throw new WsException('Target participant is not in this meeting');
    }

    this.server.to(data.targetSocketId).emit('webrtc-answer', {
      fromSocketId: client.id,
      answer: data.answer,
    });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @MessageBody()
    data: {
      roomId: string;
      targetSocketId: string;
      candidate: RTCIceCandidateInit;
    },
    @ConnectedSocket() client: AppSocket,
  ) {
    if (!data.roomId || !data.targetSocketId || !data.candidate) {
      throw new WsException(
        'Room ID, target socket ID, and ICE candidate are required',
      );
    }

    if (!client.rooms.has(data.roomId)) {
      throw new WsException('You have not joined this meeting');
    }

    const targetSocket = this.server.sockets.sockets.get(data.targetSocketId);

    if (!targetSocket) {
      throw new WsException('Target participant is not connected');
    }

    if (!targetSocket.rooms.has(data.roomId)) {
      throw new WsException('Target participant is not in this meeting');
    }

    this.server.to(data.targetSocketId).emit('ice-candidate', {
      fromSocketId: client.id,
      candidate: data.candidate,
    });
  }

  @SubscribeMessage('leave-meeting')
  async handleLeaveMeeting(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: AppSocket,
  ) {
    const user = client.data.user;

    if (!data.roomId) {
      throw new WsException('Room ID is required');
    }

    if (!client.rooms.has(data.roomId)) {
      throw new WsException('You have not joined this meeting');
    }

    client.to(data.roomId).emit('user-left', {
      socketId: client.id,
      userId: user?.id,
    });

    await client.leave(data.roomId);
  }
}

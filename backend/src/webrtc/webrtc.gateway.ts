import { BadRequestException } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
export class WebrtcGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('join-meeting')
  async handleJoinMeeting(
    @MessageBody() roomId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      if (!roomId) {
        throw new BadRequestException(
          'Room ID is required to join the meeting',
        );
      }
      await socket.join(roomId);
      socket.to(roomId).emit('user-joined', {
        userId: socket.id,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new WsException('Unable to join the meeting');
    }
  }

  @SubscribeMessage('offer')
  handleOffer(
    @MessageBody() data: { roomId: string; offer: RTCSessionDescriptionInit },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      if (!data.roomId || !data.offer) {
        throw new BadRequestException('Room ID and offer are required');
      }
      socket.to(data.roomId).emit('offer', {
        offer: data.offer,
        from: socket.id,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new WsException('An error occured while sending offer');
    }
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @MessageBody() data: { roomId: string; answer: RTCSessionDescriptionInit },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      if (!data.roomId || !data.answer) {
        throw new BadRequestException('Room ID and answer are required');
      }
      socket.to(data.roomId).emit('answer', {
        answer: data.answer,
        from: socket.id,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new WsException('An error occured while sending answer');
    }
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @MessageBody() data: { roomId: string; candidate: RTCIceCandidateInit },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      if (!data.roomId || !data.candidate) {
        throw new BadRequestException('Room ID and candidate are required');
      }
      socket.to(data.roomId).emit('ice-candidate', {
        candidate: data.candidate,
        from: socket.id,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new WsException('An error occurred while sending ice candidate');
    }
  }
}

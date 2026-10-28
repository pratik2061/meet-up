import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

export interface CreateLiveKitTokenParams {
  roomId: string;
  userId: string;
  userEmail: string;
  isHost: boolean;
}

@Injectable()
export class LiveKitService {
  private readonly logger = new Logger(LiveKitService.name);
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly livekitWsUrl: string;
  private readonly roomService?: RoomServiceClient;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('LIVEKIT_API_KEY') || 'devkey';
    this.apiSecret =
      this.configService.get<string>('LIVEKIT_API_SECRET') || 'secret';
    this.livekitWsUrl =
      this.configService.get<string>('LIVEKIT_URL') || 'ws://127.0.0.1:7880';

    try {
      const httpUrl = this.livekitWsUrl.replace(/^ws(s)?:/, 'http$1:');
      this.roomService = new RoomServiceClient(
        httpUrl,
        this.apiKey,
        this.apiSecret,
      );
    } catch (err: any) {
      this.logger.warn(`Could not initialize RoomServiceClient: ${err?.message || err}`);
    }
  }

  async createToken(params: CreateLiveKitTokenParams): Promise<{
    token: string;
    url: string;
    roomName: string;
    participantIdentity: string;
    participantName: string;
  }> {
    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity: params.userId,
      name: params.userEmail,
      metadata: JSON.stringify({
        id: params.userId,
        email: params.userEmail,
        isHost: params.isHost,
      }),
      ttl: '4h',
    });

    at.addGrant({
      room: params.roomId,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: params.isHost,
    });

    const token = await at.toJwt();

    return {
      token,
      url: this.livekitWsUrl,
      roomName: params.roomId,
      participantIdentity: params.userId,
      participantName: params.userEmail,
    };
  }

  async deleteRoom(roomId: string): Promise<void> {
    if (!this.roomService) return;
    try {
      await this.roomService.deleteRoom(roomId);
    } catch (err: any) {
      this.logger.warn(
        `Failed to delete LiveKit room ${roomId}: ${err?.message || err}`,
      );
    }
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from 'src/strategy/auth/jwt-auth.guard';
import { TokenPayLoad } from 'src/types/tokenPayload';
import { FriendService } from './friend.service';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { RespondFriendRequestDto } from './dto/respond-friend-request.dto';
import { SearchUsersQueryDto } from './dto/search-users-query.dto';

@Controller('friends')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  private getUserId(req: Request): string {
    const user = req.user as TokenPayLoad;
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated, please log in');
    }
    return user.id;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getFriends(@Req() req: Request) {
    const userId = this.getUserId(req);
    return this.friendService.getFriends(userId);
  }

  @Get('requests')
  @UseGuards(JwtAuthGuard)
  getRequests(@Req() req: Request) {
    const userId = this.getUserId(req);
    return this.friendService.getRequests(userId);
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  searchUsers(@Req() req: Request, @Query() query: SearchUsersQueryDto) {
    const userId = this.getUserId(req);
    return this.friendService.searchUsers(userId, query);
  }

  @Post('request')
  @UseGuards(JwtAuthGuard)
  sendFriendRequest(
    @Req() req: Request,
    @Body() dto: CreateFriendRequestDto,
  ) {
    const userId = this.getUserId(req);
    return this.friendService.sendFriendRequest(userId, dto);
  }

  @Patch('request/:id')
  @UseGuards(JwtAuthGuard)
  respondToRequest(
    @Req() req: Request,
    @Param('id') requestId: string,
    @Body() dto: RespondFriendRequestDto,
  ) {
    const userId = this.getUserId(req);
    return this.friendService.respondToRequest(userId, requestId, dto);
  }

  @Delete(':targetId')
  @UseGuards(JwtAuthGuard)
  removeFriend(
    @Req() req: Request,
    @Param('targetId') targetId: string,
  ) {
    const userId = this.getUserId(req);
    return this.friendService.removeFriend(userId, targetId);
  }
}

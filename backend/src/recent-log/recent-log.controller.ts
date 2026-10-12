import {
  Controller,
  Get,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { RecentLogService } from './recent-log.service';
import { JwtAuthGuard } from 'src/strategy/auth/jwt-auth.guard';
import type { Request } from 'express';
import { TokenPayLoad } from 'src/types/tokenPayload';
import { RecentLogQueryDto } from './dto/recent-log-query.dto';

@Controller('recent-log')
export class RecentLogController {
  constructor(private readonly recentLogService: RecentLogService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getRecentLogs(
    @Query() query: RecentLogQueryDto,
    @Req() req: Request,
  ) {
    const user = req.user as TokenPayLoad;
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.recentLogService.getRecentLogs(user.id, query);
  }
}

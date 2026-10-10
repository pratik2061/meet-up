import { Controller, Get, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { RecentLogService } from './recent-log.service';
import { JwtAuthGuard } from 'src/strategy/auth/jwt-auth.guard';
import type { Request } from 'express';
import { TokenPayLoad } from 'src/types/tokenPayload';

@Controller('recent-log')
export class RecentLogController {
  constructor(private readonly recentLogService: RecentLogService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getRecentLogs(@Req() req: Request) {
    const user = req.user as TokenPayLoad;
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.recentLogService.getRecentLogs(user.id);
  }
}

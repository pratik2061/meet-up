import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/strategy/auth/jwt-auth.guard';
import { TokenPayLoad } from 'src/types/tokenPayload';
import { ReportQueryDto } from './dto/report-query.dto';
import { ReportService } from './report.service';
import { Throttle } from '@nestjs/throttler';

@Controller('report')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  async getOverview(@Query() query: ReportQueryDto, @Req() req: Request) {
    const user = req.user as TokenPayLoad;
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated, please log in');
    }
    return this.reportService.getOverview(query, user.id);
  }

  @Get('summary')
  async getSummary(@Query() query: ReportQueryDto, @Req() req: Request) {
    const user = req.user as TokenPayLoad;
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated, please log in');
    }
    return this.reportService.getSummaryStats(query, user.id);
  }

  @Get('activity')
  async getActivity(@Query() query: ReportQueryDto, @Req() req: Request) {
    const user = req.user as TokenPayLoad;
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated, please log in');
    }
    return this.reportService.getMeetingActivity(query, user.id);
  }

  @Get('distribution')
  async getDistribution(@Query() query: ReportQueryDto, @Req() req: Request) {
    const user = req.user as TokenPayLoad;
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated, please log in');
    }
    return this.reportService.getDistribution(query, user.id);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Get('export')
  async exportReport(
    @Query() query: ReportQueryDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = req.user as TokenPayLoad;
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated, please log in');
    }

    const result = await this.reportService.exportReport(query, user.id);

    if (query.format === 'csv') {
      const today = new Date().toISOString().slice(0, 10);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="meeting-report-${today}.csv"`,
      );
      return res.send(result.csv);
    }

    return res.json(result);
  }
}

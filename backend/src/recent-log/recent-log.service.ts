import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RecentLog } from 'src/schemas/recent-log.schema';

@Injectable()
export class RecentLogService {
  constructor(
    @InjectModel('RecentLog') private readonly recentLogModel: Model<RecentLog>
  ) {}

  async getRecentLogs(userId: string) {
    try {
      const logs = await this.recentLogModel.find({ user: userId }).sort({ createdAt: -1 }).limit(20);
      return {
        status: true,
        message: 'Recent logs fetched successfully',
        logsData: logs,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch recent logs');
    }
  }

  async createLog(userId: string, action: string, description?: string) {
    try {
      await this.recentLogModel.create({
        user: userId,
        action,
        description,
      });
    } catch (error) {
      console.error('Failed to create recent log:', error);
      // We don't throw an error here because failing to log shouldn't break the main flow.
    }
  }
}

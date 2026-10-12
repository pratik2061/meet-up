import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RecentLog } from 'src/schemas/recent-log.schema';
import { RecentLogQueryDto } from './dto/recent-log-query.dto';

@Injectable()
export class RecentLogService {
  constructor(
    @InjectModel('RecentLog') private readonly recentLogModel: Model<RecentLog>
  ) {}

  async getRecentLogs(userId: string, query?: RecentLogQueryDto) {
    try {
      const page = Math.max(1, Number(query?.page) || 1);
      const limit = Math.max(1, Math.min(100, Number(query?.limit) || 20));
      const skip = (page - 1) * limit;

      const filter: Record<string, any> = { user: userId };

      if (query?.search && query.search.trim()) {
        const escaped = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchRegex = new RegExp(escaped, 'i');
        filter.$or = [
          { action: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
        ];
      }

      if (query?.action && query.action.trim()) {
        const escaped = query.action.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.action = { $regex: new RegExp(`^${escaped}$`, 'i') };
      }

      if (query?.startDate || query?.endDate) {
        filter.createdAt = {};
        if (query.startDate) {
          const start = new Date(query.startDate);
          if (!isNaN(start.getTime())) {
            filter.createdAt.$gte = start;
          }
        }
        if (query.endDate) {
          const end = new Date(query.endDate);
          if (!isNaN(end.getTime())) {
            if (query.endDate.length === 10) {
              end.setHours(23, 59, 59, 999);
            }
            filter.createdAt.$lte = end;
          }
        }
      }

      const [logs, total] = await Promise.all([
        this.recentLogModel
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.recentLogModel.countDocuments(filter).exec(),
      ]);

      const totalPages = Math.ceil(total / limit) || 1;

      return {
        status: true,
        message: 'Recent logs fetched successfully',
        logsData: logs,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      console.error('Error fetching recent logs:', error);
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

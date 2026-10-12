import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Meeting, MeetingStatus, MeetingType } from 'src/schemas/meeting.schema';
import { User } from 'src/schemas/user.schema';
import { ReportQueryDto } from './dto/report-query.dto';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const TYPE_CONFIG: Record<
  MeetingType,
  { label: string; fill: string; colorVar: string }
> = {
  [MeetingType.CASUALMEETING]: {
    label: 'Casual Meeting',
    fill: 'var(--chart-1)',
    colorVar: 'var(--color-chrome)',
  },
  [MeetingType.FORMALMEETING]: {
    label: 'Formal Meeting',
    fill: 'var(--chart-2)',
    colorVar: 'var(--color-safari)',
  },
  [MeetingType.STUDYMEETING]: {
    label: 'Study Meeting',
    fill: 'var(--chart-3)',
    colorVar: 'var(--color-firefox)',
  },
  [MeetingType.OTHERMEETING]: {
    label: 'Other Meeting',
    fill: 'var(--chart-4)',
    colorVar: 'var(--color-edge)',
  },
};

const STATUS_CONFIG: Record<
  MeetingStatus,
  { label: string; fill: string }
> = {
  [MeetingStatus.COMPLETED]: {
    label: 'Completed',
    fill: 'var(--chart-1)',
  },
  [MeetingStatus.ONGOING]: {
    label: 'Ongoing',
    fill: 'var(--chart-2)',
  },
  [MeetingStatus.SCHEDULED]: {
    label: 'Scheduled',
    fill: 'var(--chart-3)',
  },
  [MeetingStatus.CANCELLED]: {
    label: 'Cancelled',
    fill: 'var(--chart-5)',
  },
};

@Injectable()
export class ReportService {
  constructor(
    @InjectModel('Meeting') private readonly meetingModel: Model<Meeting>,
    @InjectModel('User') private readonly userModel: Model<User>,
  ) {}

  private parseDateRange(startDateStr?: string, endDateStr?: string) {
    const endDate = endDateStr ? new Date(endDateStr) : new Date();
    // Default to last 30 days if not provided
    const startDate = startDateStr
      ? new Date(startDateStr)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format provided');
    }

    const durationMs = Math.max(endDate.getTime() - startDate.getTime(), 1000);
    const prevEndDate = new Date(startDate.getTime());
    const prevStartDate = new Date(startDate.getTime() - durationMs);

    return { startDate, endDate, prevStartDate, prevEndDate };
  }

  private buildMeetingScopeFilter(
    startDate: Date,
    endDate: Date,
    scope?: 'all' | 'user',
    userId?: string,
  ) {
    const filter: Record<string, any> = {
      createdAt: { $gte: startDate, $lte: endDate },
    };

    if (scope === 'user' && userId) {
      const userObjectId = Types.ObjectId.isValid(userId)
        ? new Types.ObjectId(userId)
        : userId;
      filter.$or = [{ host: userObjectId }, { participants: userObjectId }];
    }

    return filter;
  }

  private calculateChange(current: number, previous: number) {
    if (previous === 0) {
      if (current === 0) {
        return { change: '0% from last period', positive: true, percent: 0 };
      }
      return {
        change: '+100% from last period',
        positive: true,
        percent: 100,
      };
    }

    const diff = current - previous;
    const percent = Math.round((diff / previous) * 1000) / 10;
    const isPositive = percent >= 0;

    return {
      change: `${isPositive ? '+' : ''}${percent}% from last period`,
      positive: isPositive,
      percent,
    };
  }

  async getOverview(query: ReportQueryDto, userId: string) {
    try {
      const [summary, activity, distribution] = await Promise.all([
        this.getSummaryStats(query, userId),
        this.getMeetingActivity(query, userId),
        this.getDistribution(query, userId),
      ]);

      const range = this.parseDateRange(query.startDate, query.endDate);

      return {
        message: 'Report overview fetched successfully',
        status: true,
        dateRange: {
          startDate: range.startDate.toISOString(),
          endDate: range.endDate.toISOString(),
        },
        summary: summary.data,
        activity: activity.data,
        distribution: distribution.data,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while generating report overview',
      );
    }
  }
  async getSummaryStats(query: ReportQueryDto, userId: string) {
    try {
      const { startDate, endDate, prevStartDate, prevEndDate } =
        this.parseDateRange(query.startDate, query.endDate);

      // Total users count
      const totalUsers = await this.userModel.countDocuments();
      const currentPeriodUsers = await this.userModel.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
      });
      const prevPeriodUsers = await this.userModel.countDocuments({
        createdAt: { $gte: prevStartDate, $lt: startDate },
      });
      const userChange = this.calculateChange(
        currentPeriodUsers,
        prevPeriodUsers,
      );

      // Meetings filters
      const currentMeetingFilter = this.buildMeetingScopeFilter(
        startDate,
        endDate,
        query.scope,
        userId,
      );
      const prevMeetingFilter = this.buildMeetingScopeFilter(
        prevStartDate,
        prevEndDate,
        query.scope,
        userId,
      );

      const totalMeetings =
        await this.meetingModel.countDocuments(currentMeetingFilter);
      const prevMeetings =
        await this.meetingModel.countDocuments(prevMeetingFilter);
      const meetingChange = this.calculateChange(totalMeetings, prevMeetings);

      // Ongoing meetings (real-time active status)
      const ongoingFilter: Record<string, any> = {
        meetingStatus: MeetingStatus.ONGOING,
      };
      if (query.scope === 'user' && userId) {
        const userObjectId = Types.ObjectId.isValid(userId)
          ? new Types.ObjectId(userId)
          : userId;
        ongoingFilter.$or = [
          { host: userObjectId },
          { participants: userObjectId },
        ];
      }
      const ongoingMeetings =
        await this.meetingModel.countDocuments(ongoingFilter);

      // Completed and Scheduled meetings in range
      const completedMeetings = await this.meetingModel.countDocuments({
        ...currentMeetingFilter,
        meetingStatus: MeetingStatus.COMPLETED,
      });

      const scheduledMeetings = await this.meetingModel.countDocuments({
        ...currentMeetingFilter,
        meetingStatus: MeetingStatus.SCHEDULED,
      });

      const cancelledMeetings = await this.meetingModel.countDocuments({
        ...currentMeetingFilter,
        meetingStatus: MeetingStatus.CANCELLED,
      });

      // Stats cards array formatted to directly plug into frontend StatsCard
      const statsCards = [
        {
          metric: 'totalUsers',
          title: 'Total users',
          value: new Intl.NumberFormat('en-US').format(totalUsers),
          rawValue: totalUsers,
          change: userChange.change,
          positive: userChange.positive,
        },
        {
          metric: 'totalMeetings',
          title: 'Total Meetings',
          value: new Intl.NumberFormat('en-US').format(totalMeetings),
          rawValue: totalMeetings,
          change: meetingChange.change,
          positive: meetingChange.positive,
        },
        {
          metric: 'ongoingMeetings',
          title: 'Total Ongoing meetings',
          value: new Intl.NumberFormat('en-US').format(ongoingMeetings),
          rawValue: ongoingMeetings,
          change:
            ongoingMeetings > 0 ? '+ Active right now' : '0 active right now',
          positive: ongoingMeetings > 0,
        },
        {
          metric: 'completedMeetings',
          title: 'Completed Meetings',
          value: new Intl.NumberFormat('en-US').format(completedMeetings),
          rawValue: completedMeetings,
          change: `${completedMeetings} completed`,
          positive: true,
        },
      ];

      return {
        message: 'Report summary fetched successfully',
        status: true,
        data: {
          metrics: {
            totalUsers,
            totalMeetings,
            ongoingMeetings,
            completedMeetings,
            scheduledMeetings,
            cancelledMeetings,
          },
          statsCards,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while generating report summary',
      );
    }
  }


  async getMeetingActivity(query: ReportQueryDto, userId: string) {
    try {
      const { startDate, endDate } = this.parseDateRange(
        query.startDate,
        query.endDate,
      );

      // Ensure a continuous monthly window of at least 6 months (5 previous months + current month)
      // unless user explicitly passed a custom range spanning 6 or more months
      let activityStartDate = new Date(startDate);
      const monthDiff =
        (endDate.getFullYear() - activityStartDate.getFullYear()) * 12 +
        (endDate.getMonth() - activityStartDate.getMonth()) + 1;

      if (!query.startDate || monthDiff < 6) {
        activityStartDate = new Date(endDate);
        activityStartDate.setMonth(activityStartDate.getMonth() - 5);
        activityStartDate.setDate(1);
        activityStartDate.setHours(0, 0, 0, 0);
      }

      const matchStage: Record<string, any> = {
        createdAt: { $gte: activityStartDate, $lte: endDate },
      };

      if (query.scope === 'user' && userId) {
        const userObjectId = Types.ObjectId.isValid(userId)
          ? new Types.ObjectId(userId)
          : userId;
        matchStage.$or = [
          { host: userObjectId },
          { participants: userObjectId },
        ];
      }

      const aggregation = await this.meetingModel.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            totalMeetings: { $sum: 1 },
            completedMeetings: {
              $sum: {
                $cond: [
                  { $eq: ['$meetingStatus', MeetingStatus.COMPLETED] },
                  1,
                  0,
                ],
              },
            },
            ongoingMeetings: {
              $sum: {
                $cond: [
                  { $eq: ['$meetingStatus', MeetingStatus.ONGOING] },
                  1,
                  0,
                ],
              },
            },
            participantsCount: {
              $sum: { $size: { $ifNull: ['$participants', []] } },
            },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]);

      const aggregationMap = new Map<string, any>();
      aggregation.forEach((item) => {
        const key = `${item._id.year}-${item._id.month}`;
        aggregationMap.set(key, item);
      });

      // Build continuous chronological monthly series for the range (default 6 months if range is small)
      const activityData: Array<{
        month: string;
        shortMonth: string;
        year: number;
        totalMeetings: number;
        completedMeetings: number;
        ongoingMeetings: number;
        participants: number;
        desktop: number;
        mobile: number;
      }> = [];

      const cursor = new Date(activityStartDate);
      cursor.setDate(1);

      while (cursor <= endDate) {
        const year = cursor.getFullYear();
        const monthNum = cursor.getMonth() + 1;
        const key = `${year}-${monthNum}`;
        const record = aggregationMap.get(key);

        const totalMeetings = record?.totalMeetings || 0;
        const completedMeetings = record?.completedMeetings || 0;
        const ongoingMeetings = record?.ongoingMeetings || 0;
        const participants = record?.participantsCount || 0;

        activityData.push({
          month: MONTH_NAMES[monthNum - 1],
          shortMonth: MONTH_NAMES[monthNum - 1].slice(0, 3),
          year,
          totalMeetings,
          completedMeetings,
          ongoingMeetings,
          participants,
          // Aliases matching DashboardStatsChart Recharts keys
          desktop: totalMeetings,
          mobile: completedMeetings,
        });

        cursor.setMonth(cursor.getMonth() + 1);
      }

      return {
        message: 'Meeting activity fetched successfully',
        status: true,
        data: activityData,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while fetching meeting activity',
      );
    }
  }


  async getDistribution(query: ReportQueryDto, userId: string) {
    try {
      const { startDate, endDate } = this.parseDateRange(
        query.startDate,
        query.endDate,
      );

      const matchStage: Record<string, any> = {
        createdAt: { $gte: startDate, $lte: endDate },
      };

      if (query.scope === 'user' && userId) {
        const userObjectId = Types.ObjectId.isValid(userId)
          ? new Types.ObjectId(userId)
          : userId;
        matchStage.$or = [
          { host: userObjectId },
          { participants: userObjectId },
        ];
      }

      const [typeAgg, statusAgg, totalCount] = await Promise.all([
        this.meetingModel.aggregate([
          { $match: matchStage },
          { $group: { _id: '$meetingType', count: { $sum: 1 } } },
        ]),
        this.meetingModel.aggregate([
          { $match: matchStage },
          { $group: { _id: '$meetingStatus', count: { $sum: 1 } } },
        ]),
        this.meetingModel.countDocuments(matchStage),
      ]);

      const typeMap = new Map<string, number>();
      typeAgg.forEach((item) => typeMap.set(item._id, item.count));

      const statusMap = new Map<string, number>();
      statusAgg.forEach((item) => statusMap.set(item._id, item.count));

      const byType = Object.values(MeetingType).map((type) => {
        const count = typeMap.get(type) || 0;
        const percentage =
          totalCount > 0 ? Math.round((count / totalCount) * 1000) / 10 : 0;
        const conf = TYPE_CONFIG[type];

        return {
          type,
          label: conf?.label || type,
          count,
          percentage,
          fill: conf?.fill || 'var(--chart-1)',
          // Backward-compatible keys for default ReportPieChart component:
          browser: type,
          visitors: count,
        };
      });

      const byStatus = Object.values(MeetingStatus).map((status) => {
        const count = statusMap.get(status) || 0;
        const percentage =
          totalCount > 0 ? Math.round((count / totalCount) * 1000) / 10 : 0;
        const conf = STATUS_CONFIG[status];

        return {
          status,
          label: conf?.label || status,
          count,
          percentage,
          fill: conf?.fill || 'var(--chart-1)',
        };
      });

      return {
        message: 'Distribution data fetched successfully',
        status: true,
        data: {
          totalMeetings: totalCount,
          byType,
          byStatus,
          chartConfig: {
            visitors: { label: 'Visitors' },
            casualMeeting: { label: 'Casual Meeting', color: 'var(--chart-1)' },
            formalMeeting: { label: 'Formal Meeting', color: 'var(--chart-2)' },
            studyMeeting: { label: 'Study Meeting', color: 'var(--chart-3)' },
            otherMeeting: { label: 'Other Meeting', color: 'var(--chart-4)' },
          },
          trend: '+12.5% this month',
          positive: true,
          description: `Showing meeting distribution across ${totalCount} total meetings`,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while fetching meeting distribution',
      );
    }
  }


  async exportReport(query: ReportQueryDto, userId: string) {
    try {
      const { startDate, endDate } = this.parseDateRange(
        query.startDate,
        query.endDate,
      );

      const matchStage: Record<string, any> = {
        createdAt: { $gte: startDate, $lte: endDate },
      };

      if (query.scope === 'user' && userId) {
        const userObjectId = Types.ObjectId.isValid(userId)
          ? new Types.ObjectId(userId)
          : userId;
        matchStage.$or = [
          { host: userObjectId },
          { participants: userObjectId },
        ];
      }

      const meetings = await this.meetingModel
        .find(matchStage)
        .populate('host', 'fullName email')
        .sort({ createdAt: -1 });

      const headers = [
        'Room ID',
        'Host Name',
        'Host Email',
        'Meeting Type',
        'Status',
        'Scheduled At',
        'Started At',
        'Ended At',
        'Duration',
        'Participants Count',
        'Created At',
      ];

      const escapeCsv = (val: any): string => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const rows = meetings.map((m: any) => {
        const hostName = m.host?.fullName || 'N/A';
        const hostEmail = m.host?.email || 'N/A';
        const scheduledAt = m.scheduledAt
          ? new Date(m.scheduledAt).toISOString()
          : 'N/A';
        const startedAt = m.startedAt
          ? new Date(m.startedAt).toISOString()
          : 'N/A';
        const endedAt = m.endedAt ? new Date(m.endedAt).toISOString() : 'N/A';
        const duration = m.meetingDuration || 'N/A';
        const participantsCount = Array.isArray(m.participants)
          ? m.participants.length
          : 0;
        const createdAt = m.createdAt
          ? new Date(m.createdAt).toISOString()
          : 'N/A';

        return [
          escapeCsv(m.roomId),
          escapeCsv(hostName),
          escapeCsv(hostEmail),
          escapeCsv(m.meetingType),
          escapeCsv(m.meetingStatus),
          escapeCsv(scheduledAt),
          escapeCsv(startedAt),
          escapeCsv(endedAt),
          escapeCsv(duration),
          escapeCsv(participantsCount),
          escapeCsv(createdAt),
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');

      return {
        message: 'Report exported successfully',
        status: true,
        totalRecords: meetings.length,
        csv: csvContent,
        meetings,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while exporting report',
      );
    }
  }
}

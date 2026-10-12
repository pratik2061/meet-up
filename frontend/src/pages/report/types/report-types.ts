export interface ReportQueryParams {
  startDate?: string;
  endDate?: string;
  scope?: "all" | "user";
  format?: "csv" | "json";
}

export interface ReportStatsCardItem {
  metric: string;
  title: string;
  value: string;
  rawValue: number;
  change: string;
  positive: boolean;
}

export interface ReportSummaryMetrics {
  totalUsers: number;
  totalMeetings: number;
  ongoingMeetings: number;
  completedMeetings: number;
  scheduledMeetings: number;
  cancelledMeetings: number;
}

export interface ReportSummaryData {
  metrics: ReportSummaryMetrics;
  statsCards: ReportStatsCardItem[];
}

export interface ReportSummaryResponse {
  message: string;
  status: boolean;
  data: ReportSummaryData;
}

export interface ReportActivityItem {
  month: string;
  shortMonth: string;
  year: number;
  totalMeetings: number;
  completedMeetings: number;
  ongoingMeetings: number;
  participants: number;
  desktop: number;
  mobile: number;
}

export interface ReportActivityResponse {
  message: string;
  status: boolean;
  data: ReportActivityItem[];
}

export interface MeetingTypeDistributionItem {
  type: string;
  label: string;
  count: number;
  percentage: number;
  fill: string;
  browser: string;
  visitors: number;
}

export interface MeetingStatusDistributionItem {
  status: string;
  label: string;
  count: number;
  percentage: number;
  fill: string;
}

export interface ReportDistributionData {
  totalMeetings: number;
  byType: MeetingTypeDistributionItem[];
  byStatus: MeetingStatusDistributionItem[];
  chartConfig: Record<string, { label: string; color?: string }>;
  trend: string;
  positive: boolean;
  description: string;
}

export interface ReportDistributionResponse {
  message: string;
  status: boolean;
  data: ReportDistributionData;
}

export interface ReportOverviewData {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  summary: ReportSummaryData;
  activity: ReportActivityItem[];
  distribution: ReportDistributionData;
}

export interface ReportOverviewResponse {
  message: string;
  status: boolean;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  summary: ReportSummaryData;
  activity: ReportActivityItem[];
  distribution: ReportDistributionData;
}

export interface ReportExportResponse {
  message: string;
  status: boolean;
  totalRecords: number;
  csv: string;
  meetings: unknown[];
}

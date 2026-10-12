export interface RecentLogItem {
  _id: string;
  user: string;
  action: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecentLogPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface RecentLogsResponse {
  status: boolean;
  message: string;
  logsData: RecentLogItem[];
  pagination?: RecentLogPagination;
}

export interface RecentLogsQuery {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}


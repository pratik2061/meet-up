export interface MeetingHostInfo {
  _id: string;
  fullName?: string;
  email?: string;
}

export interface MeetingDetailsResponse {
  _id: string;
  roomId: string;
  host: string | MeetingHostInfo;
  participants: (string | MeetingHostInfo)[];
  meetingType: string;
  meetingStatus: string;
  meetingDuration?: string;
  scheduledAt?: Date | string;
  startedAt?: Date | string;
  endedAt?: Date | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MeetingResponse {
  message: string;
  meetingData: MeetingDetailsResponse;
}

export interface MeetingPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface MeetingStatusCounts {
  all: number;
  ongoing: number;
  scheduled: number;
  completed: number;
  cancelled: number;
}

export interface GetAllMeetingsResponse {
  message: string;
  status: boolean;
  meetingsData: MeetingDetailsResponse[];
  pagination?: MeetingPagination;
  counts?: MeetingStatusCounts;
}

export interface MeetingQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

export interface validateMeetingResponse {
  isValid: Boolean;
  meetingDetails: MeetingDetailsResponse;
}

export interface MeetingResponse {
  message: string;
  meetingData: {
    _id: string;
    roomId: string;
    host: string;
    participants: string[];
    meetingType: string;
    meetingStatus: string;
    meetingDuration: string;
    scheduledAt: Date;
    startedAt: Date;
    endedAt: Date;
  };
}

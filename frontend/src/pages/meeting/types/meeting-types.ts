export interface MeetingDetailsResponse {
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


export interface MeetingResponse {
  message: string;
  meetingData: MeetingDetailsResponse
}

export interface validateMeetingResponse {
  isValid: Boolean
  meetingDetails: MeetingDetailsResponse

}

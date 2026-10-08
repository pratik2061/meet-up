import { axiosInstance, type ApiResponse } from "@/util/api/axiosInstance";
import type { MeetingResponse, validateMeetingResponse } from "../types/meeting-types";

export const createMeeting = async (): Promise<
  ApiResponse<MeetingResponse>
> => {
  const res =
    await axiosInstance.post<ApiResponse<MeetingResponse>>("/meeting");
  return res.data;
};

export const getMeeting = async (roomId: string) => {
  const res = await axiosInstance.get(`/meeting/${roomId}`);
  return res.data;
};

export const validateMeeting = async (roomId: string): Promise<
  ApiResponse<validateMeetingResponse>> => {
  const res = await axiosInstance.get<
    ApiResponse<validateMeetingResponse>>(`/meeting/${roomId}/validate`);
  return res.data
}

export const endMeeting = async (roomId: string) => {
  const res = await axiosInstance.post(`/meeting/${roomId}/end`);
  return res.data;
};

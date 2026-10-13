import { axiosInstance, type ApiResponse } from "@/util/api/axiosInstance";
import type {
  GetAllMeetingsResponse,
  MeetingQuery,
  MeetingResponse,
  validateMeetingResponse,
} from "../types/meeting-types";

export interface CreateMeetingPayload {
  meetingType?: string;
  meetingStatus?: string;
  scheduledAt?: string | Date;
}

export const createMeeting = async (
  payload?: string | CreateMeetingPayload
): Promise<MeetingResponse> => {
  const body =
    typeof payload === "string"
      ? { meetingType: payload }
      : payload || {};
  const res = await axiosInstance.post<MeetingResponse>(
    "/meeting",
    body
  );
  return res.data;
};

export const getAllMeetings = async (
  params?: MeetingQuery
): Promise<GetAllMeetingsResponse> => {
  const res = await axiosInstance.get<GetAllMeetingsResponse>("/meeting", {
    params,
  });
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
  return res.data;
};

export const endMeeting = async (roomId: string) => {
  const res = await axiosInstance.post(`/meeting/${roomId}/end`);
  return res.data;
};

export const cancelMeeting = async (roomId: string): Promise<MeetingResponse> => {
  const res = await axiosInstance.patch<MeetingResponse>(`/meeting/${roomId}/cancel`);
  return res.data;
};

export interface UpdateMeetingPayload {
  meetingType?: string;
  meetingStatus?: string;
  scheduledAt?: string | Date;
}

export const updateMeeting = async (
  roomId: string,
  payload: UpdateMeetingPayload
): Promise<MeetingResponse> => {
  const res = await axiosInstance.patch<MeetingResponse>(`/meeting/${roomId}`, payload);
  return res.data;
};

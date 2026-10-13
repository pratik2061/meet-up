import { queryClient } from "@/App";
import {
  createMeeting,
  endMeeting,
  cancelMeeting,
  updateMeeting,
  getAllMeetings,
  getMeeting,
  validateMeeting,
  type CreateMeetingPayload,
  type UpdateMeetingPayload,
} from "@/pages/meeting/services/meeting";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

import type { MeetingQuery } from "@/pages/meeting/types/meeting-types";

export const useCreateMeeting = () => {
  return useMutation({
    mutationFn: (payload?: string | CreateMeetingPayload) =>
      createMeeting(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["meeting"],
      });
      queryClient.invalidateQueries({
        queryKey: ["meetings"],
      });
      queryClient.invalidateQueries({
        queryKey: ["recent-logs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["report"],
      });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message);
      }
    },
  });
};

export const useGetAllMeetings = (params?: MeetingQuery) => {
  return useQuery({
    queryKey: ["meetings", params],
    queryFn: () => getAllMeetings(params),
    staleTime: 1000 * 30,
    retry: 1,
  });
};

export const useGetMeeting = (roomId: string) => {
  return useQuery({
    queryKey: ["meeting", roomId],
    queryFn: () => getMeeting(roomId),
    enabled: Boolean(roomId && roomId !== "new"),
    staleTime: 30 * 1000,
    retry: 1,
  });
};

export const useValidateMeeting = () => {
  return useMutation({
    mutationFn: (roomId: string) => validateMeeting(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recent-logs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["report"],
      });
    },
  });
};

export const useEndMeeting = () => {
  return useMutation({
    mutationFn: (roomId: string) => endMeeting(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["meeting"],
      });
      queryClient.invalidateQueries({
        queryKey: ["meetings"],
      });
      queryClient.invalidateQueries({
        queryKey: ["recent-logs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["report"],
      });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to end meeting");
      }
    },
  });
};

export const useCancelMeeting = () => {
  return useMutation({
    mutationFn: (roomId: string) => cancelMeeting(roomId),
    onSuccess: (data) => {
      toast.success(data?.message || "Meeting cancelled successfully");
      queryClient.invalidateQueries({
        queryKey: ["meeting"],
      });
      queryClient.invalidateQueries({
        queryKey: ["meetings"],
      });
      queryClient.invalidateQueries({
        queryKey: ["recent-logs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["report"],
      });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to cancel meeting");
      } else {
        toast.error("Failed to cancel meeting");
      }
    },
  });
};

export const useUpdateMeeting = () => {
  return useMutation({
    mutationFn: ({
      roomId,
      payload,
    }: {
      roomId: string;
      payload: UpdateMeetingPayload;
    }) => updateMeeting(roomId, payload),
    onSuccess: (data) => {
      toast.success(data?.message || "Meeting updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["meeting"],
      });
      queryClient.invalidateQueries({
        queryKey: ["meetings"],
      });
      queryClient.invalidateQueries({
        queryKey: ["recent-logs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["report"],
      });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to update meeting");
      } else {
        toast.error("Failed to update meeting");
      }
    },
  });
};
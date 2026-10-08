import { queryClient } from "@/App";
import { createMeeting, getMeeting, validateMeeting } from "@/pages/meeting/services/meeting";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

export const useCreateMeeting = () => {
  return useMutation({
    mutationFn: createMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['meeting']
      })
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message);
      }
    },
  });
};

export const useGetMeeting = (roomId: string) => {
  return useQuery(
    {
      queryKey: ['meeting', roomId],
      queryFn: () => getMeeting(roomId),
      staleTime: 30 * 1000,
      retry: 3
    }
  )
}

export const useValidateMeeting = () => {
  return useMutation({
    mutationFn: (roomId: string) => validateMeeting(roomId),
  }
  )
}
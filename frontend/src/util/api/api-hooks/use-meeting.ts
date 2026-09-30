import { createMeeting } from "@/pages/meeting/services/meeting";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

export const useCreateMeeting = () => {
  return useMutation({
    mutationFn: createMeeting,
    onSuccess: (data) => {
      toast.success(data.message!);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message);
      }
    },
  });
};

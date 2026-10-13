import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "../services/updateProfile";
import type { UpdateProfilePayload } from "../types/profile.types";
import axios from "axios";
import toast from "react-hot-toast";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ["current-user"],
      });
      queryClient.invalidateQueries({
        queryKey: ["recent-logs"],
      });
      toast.success(response.message || "Profile updated successfully!");
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const errorMsg =
          error.response?.data?.message ||
          "Failed to update profile. Please try again.";
        toast.error(errorMsg);
      } else {
        toast.error("An unexpected error occurred while updating profile.");
      }
    },
  });
};

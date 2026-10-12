import { queryClient } from "@/App";
import { login } from "@/pages/auth/services/login";
import { logout } from "@/pages/auth/services/logout";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

export const useAuthLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login({
        email,
        password,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["recent-logs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["current-user"],
      });
      toast.success(data.message!);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message);
      }
    },
  });
};

export const useAuthLogout = () => {
  return useMutation({
    mutationFn: logout,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["recent-logs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["current-user"],
      });
      toast.success(data.message!);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message);
      }
    },
  });
};

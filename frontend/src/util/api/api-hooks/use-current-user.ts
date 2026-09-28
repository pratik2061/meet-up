import { currentUser } from "@/pages/auth/services/currentUser";
import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "../axiosInstance";
import type { LoginData } from "@/pages/auth/types/auth.types";
import type { AxiosError } from "axios";

export const useCurrentUser = () => {
  return useQuery<ApiResponse<LoginData>, AxiosError<{ message: string }>>({
    queryKey: ["current-user"],
    queryFn: currentUser,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
};

import { axiosInstance, type ApiResponse } from "@/util/api/axiosInstance";
import type { LoginData } from "../types/auth.types";

export const currentUser = async (): Promise<ApiResponse<LoginData>> => {
  const res = await axiosInstance.get<ApiResponse<LoginData>>("/auth/me");

  return res.data;
};

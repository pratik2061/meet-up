import { axiosInstance, type ApiResponse } from "@/util/api/axiosInstance";
import type { LoginData } from "../types/auth.types";

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<ApiResponse<LoginData>> => {
  const res = await axiosInstance.post<ApiResponse<LoginData>>("/auth/login", {
    email,
    password,
  });
  return res.data;
};

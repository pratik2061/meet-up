import { axiosInstance, type ApiResponse } from "@/util/api/axiosInstance";
import type { LoginData } from "../types/auth.types";

export interface RegisterRequestPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  password: string;
}

export const register = async (
  data: RegisterRequestPayload,
): Promise<ApiResponse<LoginData>> => {
  const res = await axiosInstance.post<ApiResponse<LoginData>>(
    "/auth/register",
    data,
  );
  return res.data;
};

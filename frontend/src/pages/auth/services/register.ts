import { axiosInstance, type ApiResponse } from "@/util/api/axiosInstance";
import type { LoginData } from "../types/auth.types";

export interface RegisterRequestPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  password: string;
  avatar?: File | null;
}

export const register = async (
  data: RegisterRequestPayload,
): Promise<ApiResponse<LoginData>> => {
  const formData = new FormData();
  formData.append("fullName", data.fullName);
  formData.append("email", data.email);
  formData.append("phoneNumber", data.phoneNumber);
  formData.append("address", data.address);
  formData.append("password", data.password);

  if (data.avatar) {
    formData.append("avatar", data.avatar);
  }

  const res = await axiosInstance.post<ApiResponse<LoginData>>(
    "/auth/register",
    formData,
  );
  return res.data;
};

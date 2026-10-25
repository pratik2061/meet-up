import { axiosInstance, type ApiResponse } from "@/util/api/axiosInstance";
import type { LoginData } from "@/pages/auth/types/auth.types";
import type { UpdateProfilePayload } from "../types/profile.types";

export const updateProfile = async (
  payload: UpdateProfilePayload,
): Promise<ApiResponse<LoginData>> => {
  const formData = new FormData();
  if (payload.fullName) formData.append("fullName", payload.fullName);
  if (payload.phoneNumber) formData.append("phoneNumber", payload.phoneNumber);
  if (payload.address) formData.append("address", payload.address);
  if (payload.avatar) {
    formData.append("avatar", payload.avatar);
  }

  const res = await axiosInstance.patch<ApiResponse<LoginData>>(
    "/auth/profile",
    formData,
  );
  return res.data;
};

import { axiosInstance, type ApiResponse } from "@/util/api/axiosInstance";
import type { LoginData } from "@/pages/auth/types/auth.types";
import type { UpdateProfilePayload } from "../types/profile.types";

export const updateProfile = async (
  payload: UpdateProfilePayload,
): Promise<ApiResponse<LoginData>> => {
  const res = await axiosInstance.patch<ApiResponse<LoginData>>(
    "/auth/profile",
    payload,
  );
  return res.data;
};

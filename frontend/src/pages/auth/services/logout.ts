import { axiosInstance, type ApiResponse } from "@/util/api/axiosInstance";

export const logout = async (): Promise<ApiResponse<{ message: string }>> => {
  const res = await axiosInstance.post<ApiResponse<{ message: string }>>("/auth/logout");
  return res.data;
};

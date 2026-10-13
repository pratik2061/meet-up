import { axiosInstance, type ApiResponse } from "@/util/api/axiosInstance";

export const forgotPassword = async ({
  email,
}: {
  email: string;
}): Promise<ApiResponse<null>> => {
  const res = await axiosInstance.post<ApiResponse<null>>(
    "/auth/forgot-password",
    { email },
  );
  return res.data;
};

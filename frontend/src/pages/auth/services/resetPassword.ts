import { axiosInstance, type ApiResponse } from "@/util/api/axiosInstance";

export const resetPassword = async ({
  token,
  newPassword,
}: {
  token: string;
  newPassword: string;
}): Promise<ApiResponse<null>> => {
  const res = await axiosInstance.post<ApiResponse<null>>(
    "/auth/reset-password",
    {
      token,
      newPassword,
    },
  );
  return res.data;
};

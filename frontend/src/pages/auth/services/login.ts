import { axiosInstance } from "@/util/api/axiosInstance";

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const res = await axiosInstance.post("/auth/login", { email, password });
  return res;
};

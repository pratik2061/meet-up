import { login } from "@/pages/auth/services/login";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useAuthLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login({
        email,
        password,
      }),
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (data) => {
      toast.error(data.message);
    },
  });
};

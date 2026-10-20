import { queryClient } from "@/App";
import { login } from "@/pages/auth/services/login";
import { logout } from "@/pages/auth/services/logout";
import { register, type RegisterRequestPayload } from "@/pages/auth/services/register";
import { forgotPassword } from "@/pages/auth/services/forgotPassword";
import { resetPassword } from "@/pages/auth/services/resetPassword";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

export const useAuthRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterRequestPayload) => register(data),
    onSuccess: (data) => {
      toast.success(
        data.message || "Account created successfully! Please sign in.",
      );
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.message;
        toast.error(
          Array.isArray(errorMsg) ? errorMsg[0] : errorMsg || "Registration failed",
        );
      } else {
        toast.error("Registration failed");
      }
    },
  });
};

export const useAuthLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login({
        email,
        password,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["recent-logs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["current-user"],
      });
      toast.success(data.message!);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message);
      }
    },
  });
};

export const useAuthLogout = () => {
  return useMutation({
    mutationFn: logout,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["recent-logs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["current-user"],
      });
      toast.success(data.message!);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message);
      }
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: ({ email }: { email: string }) => forgotPassword({ email }),
    onSuccess: (data) => {
      toast.success(
        data.message || "Password reset instructions sent to your email!",
      );
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to send reset link",
        );
      } else {
        toast.error("Failed to send reset link");
      }
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }) => resetPassword({ token, newPassword }),
    onSuccess: (data) => {
      toast.success(data.message || "Password updated successfully!");
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            "Invalid or expired reset token. Please request a new one.",
        );
      } else {
        toast.error("An error occurred while resetting password.");
      }
    },
  });
};

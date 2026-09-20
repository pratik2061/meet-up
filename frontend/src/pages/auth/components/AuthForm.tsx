import { Controller, useForm } from "react-hook-form";
import { LoginSchema, type LoginInputSchema } from "../validation/Auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeClosed } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { FaGithub } from "react-icons/fa";
import { CgGoogle } from "react-icons/cg";
import type { ApiResponse } from "@/util/api/axiosInstance";
import type { LoginData } from "../types/auth.types";
import type { LoginRequestPayload } from "../Auth.view";
import { Spinner } from "@/components/ui/spinner";

export const AuthForm = ({
  loginData,
  isPending,
  loginMutate,
}: {
  loginData: ApiResponse<LoginData> | undefined;
  isPending: boolean;
  loginMutate: (data: LoginRequestPayload) => void;
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const { control, handleSubmit } = useForm<LoginInputSchema>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginInputSchema) => {
    loginMutate({
      email: data.email,
      password: data.password,
    });
    console.log("login data is =", loginData);
  };

  return (
    <div className="flex min-h-full w-full items-center justify-center">
      <div className="w-full max-w-lg rounded-2xl border border-gray-500/20 p-6 text-center shadow-sm sm:max-w-xl sm:p-8 lg:max-w-2xl lg:p-10">
        <h1 className="mb-2 text-xl font-bold sm:text-2xl md:text-3xl">
          Welcome Back
        </h1>

        <p className="mb-8 text-sm text-gray-900/80">
          SignIn to continue to MeetUp
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
          <div className="space-y-4 w-full">
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col items-start w-full">
                  <Input
                    {...field}
                    className={`w-full h-12 px-4 text-sm border rounded-md ${
                      fieldState.error ? "border-red-500" : ""
                    }`}
                    type="email"
                    placeholder="Email"
                  />
                  {fieldState.error && (
                    <span className="mt-1 text-xs text-red-500">
                      {fieldState.error.message}
                    </span>
                  )}
                </div>
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col items-start w-full">
                  <div className="relative w-full">
                    <Input
                      {...field}
                      className={`w-full h-12 px-4 pr-12 text-sm border rounded-md ${
                        fieldState.error ? "border-red-500" : ""
                      }`}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 hover:cursor-pointer text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <Eye size={18} />
                      ) : (
                        <EyeClosed size={18} />
                      )}
                    </button>
                  </div>
                  {fieldState.error && (
                    <span className="mt-1 text-xs text-red-500">
                      {fieldState.error.message}
                    </span>
                  )}
                </div>
              )}
            />
          </div>

          <div className="text-right">
            <span className="text-sm text-blue-500 hover:text-primary hover:underline hover:cursor-pointer">
              Forgot password?
            </span>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-primary/80 hover:cursor-pointer hover:bg-primary"
          >
            {isPending ? <Spinner /> : "Sign In"}
          </Button>
        </form>
        <div className="pt-4 text-right">
          <span className="text-sm text-blue-500 hover:cursor-pointer hover:text-primary hover:underline">
            Don't have an account?
          </span>
        </div>
        <div className="relative py-4">
          <Separator />
          <label className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background text-sm text-muted-foreground">
            or continue with
          </label>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button
            variant="outline"
            className="h-12 w-full flex items-center justify-center gap-2 hover:cursor-pointer"
          >
            <CgGoogle />
            Google
          </Button>

          <Button
            variant="outline"
            className="h-12 w-full flex items-center justify-center gap-2 hover:cursor-pointer"
          >
            <FaGithub className="w-5 h-5" />
            GitHub
          </Button>
        </div>
      </div>
    </div>
  );
};

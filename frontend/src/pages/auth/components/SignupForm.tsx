import React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Eye, EyeClosed } from "lucide-react";
import { CgGoogle } from "react-icons/cg";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  SignupSchema,
  type SignupInputSchema,
} from "../validation/Auth.schema";
import type { RegisterRequestPayload } from "../services/register";
import { initiateGoogleAuth } from "../services/oauth";

interface SignupFormProps {
  isPending: boolean;
  signupMutate: (data: RegisterRequestPayload) => void;
}

export const SignupForm = ({ isPending, signupMutate }: SignupFormProps) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const { control, handleSubmit } = useForm<SignupInputSchema>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      address: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: SignupInputSchema) => {
    signupMutate({
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      address: data.address,
      password: data.password,
    });
  };

  return (
    <div className="flex min-h-full w-full items-center justify-center">
      <div className="w-full max-w-lg rounded-2xl border border-gray-500/20 p-6 text-center shadow-sm sm:max-w-xl sm:p-8 lg:max-w-2xl lg:p-10">
        <h1 className="mb-2 text-xl font-bold sm:text-2xl md:text-3xl">
          Create Account
        </h1>

        <p className="mb-8 text-sm text-gray-900/80">
          Sign up to continue to <span className="text-primary font-semibold">MeetUp</span>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
          <div className="space-y-4 w-full">
            {/* Full Name */}
            <Controller
              name="fullName"
              control={control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col items-start w-full">
                  <Input
                    {...field}
                    className={`w-full h-12 px-4 text-sm border rounded-md ${
                      fieldState.error ? "border-red-500" : ""
                    }`}
                    type="text"
                    placeholder="Full Name"
                  />
                  {fieldState.error && (
                    <span className="mt-1 text-xs text-red-500 text-left">
                      {fieldState.error.message}
                    </span>
                  )}
                </div>
              )}
            />

            {/* Email */}
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
                    <span className="mt-1 text-xs text-red-500 text-left">
                      {fieldState.error.message}
                    </span>
                  )}
                </div>
              )}
            />

            {/* Phone Number & Address */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col items-start w-full">
                    <Input
                      {...field}
                      className={`w-full h-12 px-4 text-sm border rounded-md ${
                        fieldState.error ? "border-red-500" : ""
                      }`}
                      type="tel"
                      placeholder="Phone Number (10 digits)"
                    />
                    {fieldState.error && (
                      <span className="mt-1 text-xs text-red-500 text-left">
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />

              <Controller
                name="address"
                control={control}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col items-start w-full">
                    <Input
                      {...field}
                      className={`w-full h-12 px-4 text-sm border rounded-md ${
                        fieldState.error ? "border-red-500" : ""
                      }`}
                      type="text"
                      placeholder="Address"
                    />
                    {fieldState.error && (
                      <span className="mt-1 text-xs text-red-500 text-left">
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                        aria-label={showPassword ? "Hide password" : "Show password"}
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
                      <span className="mt-1 text-xs text-red-500 text-left">
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col items-start w-full">
                    <div className="relative w-full">
                      <Input
                        {...field}
                        className={`w-full h-12 px-4 pr-12 text-sm border rounded-md ${
                          fieldState.error ? "border-red-500" : ""
                        }`}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                      />
                      <button
                        type="button"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        className="absolute right-4 top-1/2 -translate-y-1/2 hover:cursor-pointer text-gray-500"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <Eye size={18} />
                        ) : (
                          <EyeClosed size={18} />
                        )}
                      </button>
                    </div>
                    {fieldState.error && (
                      <span className="mt-1 text-xs text-red-500 text-left">
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-12 text-base font-semibold bg-primary/80 hover:cursor-pointer hover:bg-primary"
          >
            {isPending ? <Spinner /> : "Sign Up"}
          </Button>
        </form>

        <div className="pt-4 text-center sm:text-right">
          <span className="text-sm text-gray-600">Already have an account? </span>
          <Link
            to="/login"
            className="text-sm font-semibold text-blue-500 hover:cursor-pointer hover:text-primary hover:underline"
          >
            Sign In
          </Link>
        </div>

        <div className="relative py-4">
          <Separator />
          <label className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background text-sm text-muted-foreground">
            or continue with
          </label>
        </div>

        <div className="">
          <Button
            type="button"
            onClick={initiateGoogleAuth}
            variant="outline"
            className="h-12 w-full flex items-center justify-center gap-2 hover:cursor-pointer"
          >
            <CgGoogle />
            Google
          </Button>
        </div>
      </div>
    </div>
  );
};

import { Controller, useForm } from "react-hook-form";
import { LoginSchema, type LoginInputSchema } from "../validation/Auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const AuthForm = () => {
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputSchema>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = (data: LoginInputSchema) => {
    console.log("data", data);
  };
  return (
    <div className="w-full  flex items-center justify-center min-h-screen">
      <div className=" border border-gray-500/20 text-center py-10 rounded-2xl shadow-sm">
        <h1 className="md:text-3xl text-xl font-bold mb-2">Welcome Back</h1>
        <p className="text-lg text-gray-900/80 mb-4">
          SignIn to continue to MeetUp
        </p>
        <div className=" px-8 py-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 mx-4 space-y-4"
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="email"
                  className="w-full px-4 py-4 text-lg border rounded-md"
                  placeholder="Email address"
                  required
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-4 text-lg border rounded-md"
                  placeholder="Password"
                  required
                />
              )}
            />
            <div className="text-end">
              <span className="text-md text-blue-500 hover:underline hover:cursor-pointer">
                Forgot password?
              </span>
            </div>
            <div className="">
              <Button
                type="submit"
                className="w-full text-lg font-semibold  py-6 bg-primary/80 hover:cursor-pointer hover:bg-primary"
              >
                Submit
              </Button>
            </div>
          </form>
          <Separator />
        </div>
      </div>
    </div>
  );
};

import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ResetPasswordSchema,
  type ResetPasswordInputSchema,
} from "./validation/Auth.schema";
import { useResetPassword } from "@/util/api/api-hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  KeyRound,
  Lock,
  Eye,
  EyeClosed,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const resetPasswordMutation = useResetPassword();

  const { control, handleSubmit } = useForm<ResetPasswordInputSchema>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ResetPasswordInputSchema) => {
    if (!token) return;

    resetPasswordMutation.mutate(
      {
        token,
        newPassword: data.password,
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
        },
      },
    );
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
            <KeyRound className="size-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Meet<span className="text-primary">Up</span>
          </span>
        </div>

        {/* Card Container */}
        <div className="bg-card border border-border/80 rounded-2xl shadow-lg p-6 sm:p-8 backdrop-blur-sm">
          {!token ? (
            /* Missing Token State */
            <div className="text-center space-y-4">
              <div className="size-12 rounded-full bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
                <AlertTriangle className="size-6" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-foreground">
                  Invalid Reset Link
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  This password reset link is invalid or missing a security token.
                  Please request a new link from your profile or login page.
                </p>
              </div>
              <Button
                onClick={() => navigate("/login")}
                className="w-full gap-2 cursor-pointer mt-2"
              >
                <ArrowLeft className="size-4" />
                <span>Return to Sign In</span>
              </Button>
            </div>
          ) : isSuccess ? (
            /* Success State */
            <div className="text-center space-y-4">
              <div className="size-14 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center animate-in zoom-in-50 duration-300">
                <CheckCircle2 className="size-8" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-foreground">
                  Password Reset Complete
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Your password has been successfully updated. You can now sign
                  in with your new credentials.
                </p>
              </div>
              <Button
                onClick={() => navigate("/login", { replace: true })}
                className="w-full gap-2 cursor-pointer mt-2"
              >
                <ShieldCheck className="size-4" />
                <span>Proceed to Sign In</span>
              </Button>
            </div>
          ) : (
            /* Reset Form */
            <div className="space-y-5">
              <div className="text-center space-y-1.5">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Create New Password
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Your new password must be secure and different from previous ones.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* New Password */}
                <Controller
                  name="password"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Lock className="size-3.5 text-muted-foreground" />
                        <span>New Password</span>
                      </label>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          className={`w-full h-11 pr-11 text-sm bg-background border rounded-lg transition-colors ${
                            fieldState.error
                              ? "border-destructive focus-visible:ring-destructive"
                              : "border-border/80"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          {showPassword ? (
                            <Eye className="size-4" />
                          ) : (
                            <EyeClosed className="size-4" />
                          )}
                        </button>
                      </div>
                      {fieldState.error && (
                        <p className="text-[11px] text-destructive font-medium">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                {/* Confirm Password */}
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Lock className="size-3.5 text-muted-foreground" />
                        <span>Confirm Password</span>
                      </label>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Re-enter new password"
                          className={`w-full h-11 pr-11 text-sm bg-background border rounded-lg transition-colors ${
                            fieldState.error
                              ? "border-destructive focus-visible:ring-destructive"
                              : "border-border/80"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          {showConfirmPassword ? (
                            <Eye className="size-4" />
                          ) : (
                            <EyeClosed className="size-4" />
                          )}
                        </button>
                      </div>
                      {fieldState.error && (
                        <p className="text-[11px] text-destructive font-medium">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                {/* Requirements note */}
                <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-[11px] text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">
                    Password must contain:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>At least 8 characters</li>
                    <li>At least one uppercase letter</li>
                    <li>At least one number & one special symbol (@$!%*?&)</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="w-full h-11 text-sm font-semibold cursor-pointer gap-2 mt-2"
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <Spinner />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <span>Reset Password</span>
                  )}
                </Button>
              </form>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

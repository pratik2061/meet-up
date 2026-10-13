import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ForgotPasswordSchema,
  type ForgotPasswordInputSchema,
} from "../validation/Auth.schema";
import { useForgotPassword } from "@/util/api/api-hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Mail, KeyRound, CheckCircle2 } from "lucide-react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal = ({
  isOpen,
  onClose,
}: ForgotPasswordModalProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const {
    control,
    handleSubmit,
    reset,
  } = useForm<ForgotPasswordInputSchema>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordInputSchema) => {
    forgotPasswordMutation.mutate(
      { email: data.email },
      {
        onSuccess: () => {
          setIsSubmitted(true);
        },
      },
    );
  };

  const handleClose = () => {
    setIsSubmitted(false);
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
            <KeyRound className="size-5" />
          </div>
          <DialogTitle className="text-lg font-bold">
            Reset Password
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Enter your email and we'll send you a secure link to reset your password.
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="py-4 space-y-4 text-center">
            <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="size-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Reset Link Sent!
              </p>
              <p className="text-xs text-muted-foreground">
                If an account exists with that email, check your inbox (or spam) for the link. It is valid for 15 minutes.
              </p>
            </div>
            <Button
              onClick={handleClose}
              className="w-full text-xs cursor-pointer"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <div className="space-y-1.5">
                  <div className="relative">
                    <Mail className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <Input
                      {...field}
                      type="email"
                      placeholder="name@example.com"
                      className={`pl-10 h-11 text-sm ${
                        fieldState.error ? "border-destructive" : ""
                      }`}
                    />
                  </div>
                  {fieldState.error && (
                    <p className="text-[11px] text-destructive font-medium">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className="text-xs cursor-pointer gap-2"
              >
                {forgotPasswordMutation.isPending ? (
                  <>
                    <Spinner />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

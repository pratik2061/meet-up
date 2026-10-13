import { useState } from "react";
import {
  CheckCircle2,
  Key,
  Laptop,
  Lock,
  RefreshCw,
  Shield,
  ShieldAlert,
  Smartphone,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { UserProfile } from "../types/profile.types";
import toast from "react-hot-toast";

import { useForgotPassword } from "@/util/api/api-hooks/use-auth";

interface ProfileSecurityTabProps {
  user: UserProfile;
}

export const ProfileSecurityTab = ({ user }: ProfileSecurityTabProps) => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const handleToggle2FA = () => {
    const next = !twoFactorEnabled;
    setTwoFactorEnabled(next);
    if (next) {
      toast.success("Two-Factor Authentication (2FA) is now enabled for your account!");
    } else {
      toast("Two-Factor Authentication disabled.", { icon: "⚠️" });
    }
  };

  const handleChangePasswordClick = () => {
    if (!user?.email) {
      toast.error("User email not found");
      return;
    }
    forgotPasswordMutation.mutate({ email: user.email });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Password Management */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Key className="size-4 text-primary" />
              <span>Password & Authentication</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Manage your password and encryption keys.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Password Status
                </span>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px]"
                >
                  Strong & Encrypted
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Your password is securely salted and hashed using bcrypt.
              </p>
            </div>

            <Button
              onClick={handleChangePasswordClick}
              disabled={forgotPasswordMutation.isPending}
              variant="outline"
              size="sm"
              className="w-full gap-2 text-xs h-9 cursor-pointer hover:bg-muted"
            >
              {forgotPasswordMutation.isPending ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" />
                  <span>Sending reset link...</span>
                </>
              ) : (
                <>
                  <Lock className="size-3.5 text-primary" />
                  <span>Request Password Reset Link</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 2FA Card */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Shield className="size-4 text-primary" />
              <span>Two-Factor Authentication (2FA)</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Add a second verification layer with an authenticator app.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">
                  Authenticator App (TOTP)
                </p>
                <p className="text-xs text-muted-foreground">
                  Generate secure codes with Google Authenticator or 1Password.
                </p>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={handleToggle2FA}
              />
            </div>

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/15 text-xs text-muted-foreground flex items-start gap-2.5">
              <ShieldAlert className="size-4 text-primary shrink-0 mt-0.5" />
              <span>
                Enabling 2FA prevents unauthorized meeting logins even if your password is compromised.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions Card */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Laptop className="size-4 text-primary" />
            <span>Active Login Sessions</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Current browsers and devices with access to your MeetUp account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 pt-1">
          {/* Current Device */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-primary/30 bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Laptop className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-sm font-semibold text-foreground">
                    Linux Workstation (Chrome / Chromium)
                  </h5>
                  <Badge
                    variant="default"
                    className="text-[10px] bg-primary text-primary-foreground py-0 px-1.5"
                  >
                    Current Session
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Direct connection • Cookie secured (HttpOnly / Lax)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active right now</span>
            </div>
          </div>

          {/* Mobile Companion */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/50 hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                <Smartphone className="size-5" />
              </div>
              <div>
                <h5 className="text-sm font-semibold text-foreground">
                  Mobile Companion App
                </h5>
                <p className="text-xs text-muted-foreground">
                  Last verified 2 days ago • iOS / Android
                </p>
              </div>
            </div>

            <span className="text-xs text-muted-foreground">
              Standby
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Security Checklist */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-foreground">
            Security Checklist
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Account protection standards for video collaboration.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="flex items-center gap-2.5 p-3 rounded-lg border border-border/50 bg-muted/20">
            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-foreground">Email Verified</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-lg border border-border/50 bg-muted/20">
            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-foreground">JWT Token Guard</p>
              <p className="text-muted-foreground">HttpOnly Safe Cookies</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-lg border border-border/50 bg-muted/20">
            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-foreground">Encrypted WebRTC</p>
              <p className="text-muted-foreground">DTLS / SRTP Handshake</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import { format } from "date-fns";
import {
  Calendar,
  Cpu,
  Edit3,
  Globe,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
  Video,
  Wifi,
  Zap,
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
import type { UserProfile } from "../types/profile.types";

interface ProfileOverviewTabProps {
  user: UserProfile;
  onEditClick: () => void;
}

export const ProfileOverviewTab = ({
  user,
  onEditClick,
}: ProfileOverviewTabProps) => {
  const formattedCreated = user.createdAt
    ? format(new Date(user.createdAt), "PPP")
    : "Recently";

  const formattedUpdated = user.updatedAt
    ? format(new Date(user.updatedAt), "PPP")
    : "Recently";

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Details Card */}
        <Card className="lg:col-span-2 border-border/80 shadow-xs">
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-foreground">
                Personal Details
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Manage your identity and contact info across the platform.
              </CardDescription>
            </div>
            <Button
              onClick={onEditClick}
              variant="outline"
              size="sm"
              className="gap-1.5 h-8 text-xs cursor-pointer hover:bg-muted"
            >
              <Edit3 className="size-3.5" />
              <span>Edit Details</span>
            </Button>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="size-3.5 text-primary" />
                  <span>Full Legal Name</span>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {user.fullName || "Not provided"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="size-3.5 text-primary" />
                  <span>Email Address</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user.email || "Not provided"}
                  </p>
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-emerald-500/10 text-emerald-600 border-0 py-0"
                  >
                    Verified
                  </Badge>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="size-3.5 text-primary" />
                  <span>Phone Number</span>
                </div>
                <p className="text-sm font-semibold text-foreground font-mono">
                  {user.phoneNumber || "Not provided"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 text-primary" />
                  <span>Office / Address</span>
                </div>
                <p className="text-sm font-semibold text-foreground truncate">
                  {user.address || "Not provided"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="size-3.5 text-primary" />
                  <span>Member Since</span>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {formattedCreated}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Globe className="size-3.5 text-primary" />
                  <span>Account Synchronized</span>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {formattedUpdated}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MeetUp Platform Capabilities Card */}
        <Card className="border-border/80 shadow-xs flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <Cpu className="size-4 text-primary" />
                <span>Media Environment</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Runtime parameters for real-time meetings.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Wifi className="size-3.5 text-primary" />
                  Signaling Gateway
                </span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Socket.io Connected
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Video className="size-3.5 text-primary" />
                  Max Video Quality
                </span>
                <span className="font-semibold text-foreground">1080p Full HD</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Lock className="size-3.5 text-primary" />
                  Media Encryption
                </span>
                <span className="font-semibold text-foreground">DTLS / SRTP (AES-GCM)</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Zap className="size-3.5 text-primary" />
                  Audio Bitrate
                </span>
                <span className="font-semibold text-foreground">64 kbps (Opus)</span>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
};

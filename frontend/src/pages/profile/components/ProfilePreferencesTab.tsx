import {
  Bell,
  Camera,
  Mic,
  RotateCcw,
  Sliders,
  Volume2,
  Waves,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { UserPreferences } from "../types/profile.types";
import toast from "react-hot-toast";

interface ProfilePreferencesTabProps {
  preferences: UserPreferences;
  onUpdatePreference: <K extends keyof UserPreferences>(
    key: K,
    val: UserPreferences[K],
  ) => void;
  onResetPreferences: () => void;
}

export const ProfilePreferencesTab = ({
  preferences,
  onUpdatePreference,
  onResetPreferences,
}: ProfilePreferencesTabProps) => {
  const handleToggle = <K extends keyof UserPreferences>(
    key: K,
    currentVal: boolean,
  ) => {
    onUpdatePreference(key, (!currentVal) as UserPreferences[K]);
    toast.success("Preference updated and saved", {
      id: "pref-saved",
      duration: 1500,
    });
  };

  return (
    <div className="space-y-6">
      {/* Intro banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/80 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Sliders className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Meeting Experience & Hardware Defaults
            </h3>
            <p className="text-xs text-muted-foreground">
              Custom settings apply automatically to all instant and scheduled meetings.
            </p>
          </div>
        </div>

        <Button
          onClick={onResetPreferences}
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs h-8 cursor-pointer hover:bg-muted"
        >
          <RotateCcw className="size-3.5" />
          <span>Reset Defaults</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Audio & Video Controls */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Camera className="size-4 text-primary" />
              <span>Camera & Video Settings</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Configure how your webcam behaves when entering sessions.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">
                  Turn off camera on join
                </p>
                <p className="text-xs text-muted-foreground">
                  Start meetings with camera disabled until you turn it on.
                </p>
              </div>
              <Switch
                checked={preferences.turnOffCameraOnJoin}
                onCheckedChange={() =>
                  handleToggle(
                    "turnOffCameraOnJoin",
                    preferences.turnOffCameraOnJoin,
                  )
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">
                  High-Definition (HD 1080p) Video
                </p>
                <p className="text-xs text-muted-foreground">
                  Transmit full high-res stream when network bandwidth permits.
                </p>
              </div>
              <Switch
                checked={preferences.hdVideo}
                onCheckedChange={() =>
                  handleToggle("hdVideo", preferences.hdVideo)
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">
                  Mirror video preview
                </p>
                <p className="text-xs text-muted-foreground">
                  Flip local video feed horizontally for a natural mirror view.
                </p>
              </div>
              <Switch
                checked={preferences.mirrorVideo}
                onCheckedChange={() =>
                  handleToggle("mirrorVideo", preferences.mirrorVideo)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Audio & Noise Controls */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Mic className="size-4 text-primary" />
              <span>Microphone & Audio Settings</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Manage input levels, suppression, and join behavior.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">
                  Mute microphone on join
                </p>
                <p className="text-xs text-muted-foreground">
                  Join all conference rooms muted to avoid background chatter.
                </p>
              </div>
              <Switch
                checked={preferences.muteMicOnJoin}
                onCheckedChange={() =>
                  handleToggle("muteMicOnJoin", preferences.muteMicOnJoin)
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Waves className="size-3.5 text-primary" />
                  AI Noise Suppression
                </p>
                <p className="text-xs text-muted-foreground">
                  Filter out keyboard clicks, barking dogs, and background hum.
                </p>
              </div>
              <Switch
                checked={preferences.noiseCancellation}
                onCheckedChange={() =>
                  handleToggle(
                    "noiseCancellation",
                    preferences.noiseCancellation,
                  )
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Volume2 className="size-3.5 text-primary" />
                  Participant Chimes
                </p>
                <p className="text-xs text-muted-foreground">
                  Play gentle tone when someone joins or disconnects.
                </p>
              </div>
              <Switch
                checked={preferences.joinLeaveChime}
                onCheckedChange={() =>
                  handleToggle("joinLeaveChime", preferences.joinLeaveChime)
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Card */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            <span>Notifications & Alerts</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Control incoming calls, invites, and calendar reminders.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-1">
          <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">
                Desktop Push Notifications
              </p>
              <p className="text-xs text-muted-foreground">
                Receive browser alert popups when invited to join meetings.
              </p>
            </div>
            <Switch
              checked={preferences.pushNotifications}
              onCheckedChange={() =>
                handleToggle(
                  "pushNotifications",
                  preferences.pushNotifications,
                )
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

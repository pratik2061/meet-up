import type { LoginData } from "@/pages/auth/types/auth.types";

export interface UpdateProfilePayload {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
}

export interface UserPreferences {
  muteMicOnJoin: boolean;
  turnOffCameraOnJoin: boolean;
  hdVideo: boolean;
  noiseCancellation: boolean;
  mirrorVideo: boolean;
  joinLeaveChime: boolean;
  pushNotifications: boolean;
}

export type ProfileTabType = "overview" | "preferences" | "security";

export type UserProfile = LoginData;

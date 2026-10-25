import { useState, useEffect } from "react";
import { useCurrentUser } from "@/util/api/api-hooks/use-current-user";
import { useUpdateProfile } from "./hooks/useUpdateProfile";
import { ProfileView } from "./Profile.view";
import type {
  ProfileTabType,
  UpdateProfilePayload,
  UserPreferences,
} from "./types/profile.types";
import toast from "react-hot-toast";

const PREFERENCES_STORAGE_KEY = "meetup_user_preferences";

const defaultPreferences: UserPreferences = {
  muteMicOnJoin: false,
  turnOffCameraOnJoin: false,
  hdVideo: true,
  noiseCancellation: true,
  mirrorVideo: true,
  joinLeaveChime: true,
  pushNotifications: true,
};

export const ProfileContainer = () => {
  const { data: userData, isLoading } = useCurrentUser();
  const updateProfileMutation = useUpdateProfile();

  const [activeTab, setActiveTab] = useState<ProfileTabType>("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load preferences from localStorage
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (stored) {
        return { ...defaultPreferences, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback to default
    }
    return defaultPreferences;
  });

  // Save preferences to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(
        PREFERENCES_STORAGE_KEY,
        JSON.stringify(preferences),
      );
    } catch {
      // Ignore localStorage errors
    }
  }, [preferences]);

  const handleUpdatePreference = <K extends keyof UserPreferences>(
    key: K,
    val: UserPreferences[K],
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleResetPreferences = () => {
    setPreferences(defaultPreferences);
    toast.success("Preferences reset to defaults!");
  };

  const handleUpdateProfile = (data: UpdateProfilePayload) => {
    updateProfileMutation.mutate(data, {
      onSuccess: () => {
        setIsEditModalOpen(false);
      },
    });
  };

  return (
    <ProfileView
      user={userData?.data}
      isLoading={isLoading}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isEditModalOpen={isEditModalOpen}
      onOpenEditModal={() => setIsEditModalOpen(true)}
      onCloseEditModal={() => setIsEditModalOpen(false)}
      onUpdateProfile={handleUpdateProfile}
      isUpdatingProfile={updateProfileMutation.isPending}
      preferences={preferences}
      onUpdatePreference={handleUpdatePreference}
      onResetPreferences={handleResetPreferences}
    />
  );
};

export default ProfileContainer;

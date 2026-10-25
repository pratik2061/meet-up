import {
  LayoutDashboard,
  ShieldCheck,
  Sliders,
  User,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileHero } from "./components/ProfileHero";
import { ProfileOverviewTab } from "./components/ProfileOverviewTab";
import { ProfilePreferencesTab } from "./components/ProfilePreferencesTab";
import { ProfileSecurityTab } from "./components/ProfileSecurityTab";
import { ProfileEditModal } from "./components/ProfileEditModal";
import type {
  ProfileTabType,
  UpdateProfilePayload,
  UserPreferences,
  UserProfile,
} from "./types/profile.types";

interface ProfileViewProps {
  user: UserProfile | undefined;
  isLoading: boolean;
  activeTab: ProfileTabType;
  onTabChange: (tab: ProfileTabType) => void;
  isEditModalOpen: boolean;
  onOpenEditModal: () => void;
  onCloseEditModal: () => void;
  onUpdateProfile: (data: UpdateProfilePayload) => void;
  isUpdatingProfile: boolean;
  preferences: UserPreferences;
  onUpdatePreference: <K extends keyof UserPreferences>(
    key: K,
    val: UserPreferences[K],
  ) => void;
  onResetPreferences: () => void;
}

export const ProfileView = ({
  user,
  isLoading,
  activeTab,
  onTabChange,
  isEditModalOpen,
  onOpenEditModal,
  onCloseEditModal,
  onUpdateProfile,
  isUpdatingProfile,
  preferences,
  onUpdatePreference,
  onResetPreferences,
}: ProfileViewProps) => {
  if (isLoading) {
    return (
      <div className="w-full lg:px-6 px-4 lg:py-6 py-4 space-y-6 max-w-6xl mx-auto">
        {/* Skeleton Profile Header */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4 sm:gap-5">
              <Skeleton className="size-20 sm:size-22 rounded-2xl shrink-0" />
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-44 rounded-md" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-52 rounded-md" />
                  <Skeleton className="h-4 w-28 rounded-md" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24 rounded-lg" />
              <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
          </div>
          <div className="pt-4 border-t border-border/60 flex items-center justify-between">
            <Skeleton className="h-4 w-60 rounded-md" />
            <Skeleton className="h-4 w-32 rounded-md" />
          </div>
        </div>

        {/* Skeleton Tabs */}
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full lg:px-6 px-4 lg:py-12 py-8 flex flex-col items-center justify-center text-center space-y-3">
        <div className="size-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <User className="size-7" />
        </div>
        <h3 className="text-lg font-bold text-foreground">
          Profile Not Found
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Unable to retrieve your profile information. Please ensure you are logged in.
        </p>
      </div>
    );
  }

  const tabs: {
    id: ProfileTabType;
    label: string;
    icon: React.ElementType;
  }[] = [
      {
        id: "overview",
        label: "Account Overview",
        icon: LayoutDashboard,
      },
      {
        id: "preferences",
        label: "Meeting Preferences",
        icon: Sliders,
      },
      {
        id: "security",
        label: "Security & Sessions",
        icon: ShieldCheck,
      },
    ];

  return (
    <div className="w-full lg:px-6 px-4 lg:py-6 py-4 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Profile Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your personal credentials, meeting preferences, and account security.
          </p>
        </div>
      </div>

      <ProfileHero user={user} onEditClick={onOpenEditModal} />

      <div className="flex items-center gap-1.5 p-1 bg-muted/60 backdrop-blur-md rounded-xl overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer select-none ${isActive
                  ? "bg-card text-primary font-semibold shadow-xs ring-1 ring-border/80"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
            >
              <Icon className={`size-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="pt-1">
        {activeTab === "overview" && (
          <ProfileOverviewTab user={user} onEditClick={onOpenEditModal} />
        )}

        {activeTab === "preferences" && (
          <ProfilePreferencesTab
            preferences={preferences}
            onUpdatePreference={onUpdatePreference}
            onResetPreferences={onResetPreferences}
          />
        )}

        {activeTab === "security" && <ProfileSecurityTab user={user} />}
      </div>

      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={onCloseEditModal}
        user={user}
        onSubmit={onUpdateProfile}
        isPending={isUpdatingProfile}
      />
    </div>
  );
};

import { useState } from "react";
import { format } from "date-fns";
import {
  Check,
  Copy,
  Edit3,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "../types/profile.types";
import DefaultProfileImage from "@/assets/default_profile.webp";
import toast from "react-hot-toast";

interface ProfileHeroProps {
  user: UserProfile;
  onEditClick: () => void;
}

export const ProfileHero = ({ user, onEditClick }: ProfileHeroProps) => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const initials = user.fullName
    ? user.fullName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
    : "U";

  const formattedDate = user.createdAt
    ? format(new Date(user.createdAt), "MMMM yyyy")
    : "Recent";


  const handleCopyEmail = () => {
    if (user.email) {
      navigator.clipboard.writeText(user.email);
      setCopiedEmail(true);
      toast.success("Email copied to clipboard!");
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="relative shrink-0">
            <div className="size-20 sm:size-22 rounded-2xl p-0.5 bg-gradient-to-tr from-primary/30 via-indigo-500/20 to-primary/10 border border-primary/20 shadow-xs">
              <div className="size-full rounded-[14px] overflow-hidden bg-muted/40 flex items-center justify-center">
                {user.profileImageId ? (
                  <img
                    src={DefaultProfileImage}
                    alt={user.fullName}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="size-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center text-primary font-bold text-2xl sm:text-3xl">
                    {initials}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                {user.fullName}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
              <button
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer group"
                title="Click to copy email"
              >
                <Mail className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="truncate max-w-[220px] sm:max-w-none">{user.email}</span>
                {copiedEmail ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3 opacity-60 group-hover:opacity-100" />
                )}
              </button>

              <span className="text-muted-foreground/40">•</span>

              <span>Joined {formattedDate}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:self-center shrink-0 pt-2 sm:pt-0">

          <Button
            onClick={onEditClick}
            size="sm"
            className="gap-2 h-9 text-xs sm:text-sm font-medium shadow-xs cursor-pointer"
          >
            <Edit3 className="size-3.5" />
            <span>Edit Profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

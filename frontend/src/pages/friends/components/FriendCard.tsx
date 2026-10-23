import React from "react";
import { FiVideo, FiTrash2, FiCopy, FiCalendar } from "react-icons/fi";
import type { FriendItem, FriendUser } from "../types/friends.types";
import { Spinner } from "@/components/ui/spinner";

interface FriendCardProps {
  friendship: FriendItem;
  onStartMeeting: (friend: FriendUser) => void;
  onCopyInvite: (friend: FriendUser) => void;
  onRemove: (friendshipId: string, friendName: string) => void;
  isStartingMeeting?: boolean;
}

export const FriendCard: React.FC<FriendCardProps> = ({
  friendship,
  onStartMeeting,
  onCopyInvite,
  onRemove,
  isStartingMeeting = false,
}) => {
  const { friend, friendsSince } = friendship;

  // Format initials
  const initials = friend.fullName
    ? friend.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  // Format date
  const formattedDate = friendsSince
    ? new Date(friendsSince).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="group relative bg-card border border-border/70 hover:border-primary/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          {friend.avatarUrl ? (
            <img
              src={friend.avatarUrl}
              alt={friend.fullName}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20 shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-base shrink-0 ring-2 ring-primary/20">
              {initials}
            </div>
          )}

          <div className="min-w-0">
            <h3 className="font-semibold text-foreground text-base truncate group-hover:text-primary transition-colors">
              {friend.fullName}
            </h3>
            <p className="text-xs text-muted-foreground truncate">{friend.email}</p>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground/80">
              <FiCalendar className="w-3 h-3" />
              <span>Friends since {formattedDate}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onRemove(friendship.friendshipId, friend.fullName)}
          className="text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors cursor-pointer"
          title="Remove Friend"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
        <button
          onClick={() => onStartMeeting(friend)}
          disabled={isStartingMeeting}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          {isStartingMeeting ? (
            <Spinner className="w-3.5 h-3.5 text-primary-foreground" />
          ) : (
            <FiVideo className="w-3.5 h-3.5" />
          )}
          <span>Start Call</span>
        </button>

        <button
          onClick={() => onCopyInvite(friend)}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 text-foreground font-medium text-xs rounded-xl transition-colors cursor-pointer border border-border/60"
        >
          <FiCopy className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Copy Invite</span>
        </button>
      </div>
    </div>
  );
};

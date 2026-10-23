import React, { useState } from "react";
import { FiSearch, FiUserPlus, FiCheck, FiClock, FiMail, FiUsers } from "react-icons/fi";
import type { SearchFriendUser } from "../types/friends.types";
import { Spinner } from "@/components/ui/spinner";

interface FindFriendsSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults?: SearchFriendUser[];
  isSearching: boolean;
  onSendRequest: (payload: { email?: string; recipientId?: string }) => void;
  isSending: boolean;
  sendingTargetId?: string | null;
}

export const FindFriendsSection: React.FC<FindFriendsSectionProps> = ({
  searchQuery,
  onSearchChange,
  searchResults = [],
  isSearching,
  onSendRequest,
  isSending,
  sendingTargetId = null,
}) => {
  const [directEmail, setDirectEmail] = useState("");

  const handleDirectAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directEmail.trim()) return;
    onSendRequest({ email: directEmail.trim() });
    setDirectEmail("");
  };

  return (
    <div className="space-y-6">
      {/* Quick Add by Email Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-primary font-semibold text-base mb-1">
            <FiMail className="w-5 h-5" />
            <span>Add Friend by Email</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Know your friend's email address? Send them a quick friend request directly.
          </p>

          <form onSubmit={handleDirectAdd} className="flex flex-col sm:flex-row gap-2 max-w-md">
            <input
              type="email"
              placeholder="friend@example.com"
              value={directEmail}
              onChange={(e) => setDirectEmail(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              required
            />
            <button
              type="submit"
              disabled={isSending || !directEmail.trim()}
              className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-sm rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
            >
              {isSending && !sendingTargetId ? (
                <Spinner className="w-4 h-4 text-primary-foreground" />
              ) : (
                <FiUserPlus className="w-4 h-4" />
              )}
              <span>Send Request</span>
            </button>
          </form>
        </div>
      </div>

      {/* Directory Search Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Discover People
            </h2>
            <p className="text-xs text-muted-foreground">
              Search colleagues and peers registered on MeetUp
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Search Results */}
        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <Spinner className="w-7 h-7 text-primary" />
            <p className="text-sm">Searching users...</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="bg-card border border-border/70 rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mb-4">
              <FiUsers className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {searchQuery ? "No Users Found" : "No Other Users Yet"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? `No users matched "${searchQuery}". Try searching with a different name or email.`
                : "You can invite your friends by sending a request using their email above."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((user) => {
              const isTargetSending =
                isSending && sendingTargetId === user._id;

              const initials = user.fullName
                ? user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "U";

              return (
                <div
                  key={user._id}
                  className="bg-card border border-border/80 hover:border-primary/30 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName}
                        className="w-11 h-11 rounded-full object-cover shrink-0 ring-1 ring-border"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-semibold text-foreground text-sm truncate">
                        {user.fullName}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Relationship action */}
                  <div className="shrink-0">
                    {user.relationship === "FRIENDS" ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2.5 py-1.5 rounded-xl">
                        <FiCheck className="w-3.5 h-3.5" />
                        Friends
                      </span>
                    ) : user.relationship === "PENDING_OUTGOING" ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-500/10 px-2.5 py-1.5 rounded-xl">
                        <FiClock className="w-3.5 h-3.5" />
                        Pending
                      </span>
                    ) : user.relationship === "PENDING_INCOMING" ? (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1.5 rounded-xl">
                        Requested You
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          onSendRequest({ recipientId: user._id })
                        }
                        disabled={isTargetSending}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isTargetSending ? (
                          <Spinner className="w-3.5 h-3.5 text-primary-foreground" />
                        ) : (
                          <FiUserPlus className="w-3.5 h-3.5" />
                        )}
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

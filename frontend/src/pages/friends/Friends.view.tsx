import React, { useState } from "react";
import {
  FiUsers,
  FiUserPlus,
  FiInbox,
  FiSearch,
  FiUserCheck,
} from "react-icons/fi";
import { FriendCard } from "./components/FriendCard";
import { FriendRequestsSection } from "./components/FriendRequestsSection";
import { FindFriendsSection } from "./components/FindFriendsSection";
import type {
  FriendItem,
  FriendRequestsData,
  FriendUser,
  SearchFriendUser,
} from "./types/friends.types";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type FriendsTab = "all" | "requests" | "find";

interface FriendsViewProps {
  activeTab: FriendsTab;
  onTabChange: (tab: FriendsTab) => void;
  friends: FriendItem[];
  isLoadingFriends: boolean;
  requestsData?: FriendRequestsData;
  isLoadingRequests: boolean;
  friendSearchFilter: string;
  onFriendSearchFilterChange: (val: string) => void;
  searchQuery: string;
  onSearchQueryChange: (val: string) => void;
  searchResults?: SearchFriendUser[];
  isSearchingUsers: boolean;
  onStartMeeting: (friend: FriendUser) => void;
  onCopyInvite: (friend: FriendUser) => void;
  onRemoveFriend: (targetId: string) => void;
  onSendRequest: (payload: { email?: string; recipientId?: string }) => void;
  onRespondRequest: (requestId: string, status: "ACCEPTED" | "REJECTED") => void;
  onCancelOutgoingRequest: (requestId: string) => void;
  isStartingMeeting: boolean;
  startingFriendId: string | null;
  isSendingRequest: boolean;
  sendingTargetId: string | null;
  isRespondingRequest: boolean;
  respondingRequestId: string | null;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
  activeTab,
  onTabChange,
  friends,
  isLoadingFriends,
  requestsData,
  isLoadingRequests,
  friendSearchFilter,
  onFriendSearchFilterChange,
  searchQuery,
  onSearchQueryChange,
  searchResults,
  isSearchingUsers,
  onStartMeeting,
  onCopyInvite,
  onRemoveFriend,
  onSendRequest,
  onRespondRequest,
  onCancelOutgoingRequest,
  isStartingMeeting,
  startingFriendId,
  isSendingRequest,
  sendingTargetId,
  isRespondingRequest,
  respondingRequestId,
}) => {
  // Confirmation state for deleting a friend
  const [friendToRemove, setFriendToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Filter friends locally by name or email
  const filteredFriends = friends.filter((f) => {
    if (!friendSearchFilter.trim()) return true;
    const term = friendSearchFilter.toLowerCase();
    return (
      f.friend.fullName.toLowerCase().includes(term) ||
      f.friend.email.toLowerCase().includes(term)
    );
  });

  const incomingCount = requestsData?.incomingCount || 0;

  return (
    <div className="min-h-full bg-background text-foreground px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FiUsers className="w-7 h-7 text-primary" />
            <span>Friends & Contacts</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect with friends, launch instant video calls, and skip sharing meeting IDs manually.
          </p>
        </div>

        {/* Quick Tabs Button Navigation */}
        <div className="inline-flex p-1 bg-muted rounded-2xl border border-border/80 self-start sm:self-auto">
          <button
            onClick={() => onTabChange("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FiUserCheck className="w-4 h-4" />
            <span>My Friends</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${
                activeTab === "all"
                  ? "bg-primary/10 text-primary"
                  : "bg-background text-muted-foreground"
              }`}
            >
              {friends.length}
            </span>
          </button>

          <button
            onClick={() => onTabChange("requests")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer relative ${
              activeTab === "requests"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FiInbox className="w-4 h-4" />
            <span>Requests</span>
            {incomingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary text-primary-foreground animate-pulse">
                {incomingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange("find")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === "find"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FiUserPlus className="w-4 h-4" />
            <span>Find & Add</span>
          </button>
        </div>
      </div>

      {/* Tab 1: My Friends */}
      {activeTab === "all" && (
        <div className="space-y-6">
          {/* Controls: Search filter & Quick CTA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Filter friends by name or email..."
                value={friendSearchFilter}
                onChange={(e) => onFriendSearchFilterChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <button
              onClick={() => onTabChange("find")}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-medium text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
            >
              <FiUserPlus className="w-4 h-4" />
              <span>Add New Friend</span>
            </button>
          </div>

          {/* Friends Grid */}
          {isLoadingFriends ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <Spinner className="w-8 h-8 text-primary" />
              <p className="text-sm">Loading your friends list...</p>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="bg-card border border-border/70 rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <FiUsers className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {friendSearchFilter ? "No Matches Found" : "No Friends Added Yet"}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {friendSearchFilter
                  ? `No friends match "${friendSearchFilter}". Try a different search term.`
                  : "Add friends to quickly jump into meetings together without having to copy-paste meeting codes every time!"}
              </p>
              {!friendSearchFilter && (
                <button
                  onClick={() => onTabChange("find")}
                  className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-sm rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                >
                  <FiUserPlus className="w-4 h-4" />
                  <span>Discover Friends</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFriends.map((f) => (
                <FriendCard
                  key={f.friendshipId}
                  friendship={f}
                  onStartMeeting={onStartMeeting}
                  onCopyInvite={onCopyInvite}
                  onRemove={(id, name) => setFriendToRemove({ id, name })}
                  isStartingMeeting={
                    isStartingMeeting && startingFriendId === f.friend._id
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Requests */}
      {activeTab === "requests" && (
        <FriendRequestsSection
          requestsData={requestsData}
          isLoading={isLoadingRequests}
          onRespond={onRespondRequest}
          onCancelOutgoing={onCancelOutgoingRequest}
          isResponding={isRespondingRequest}
          respondingId={respondingRequestId}
        />
      )}

      {/* Tab 3: Find & Add People */}
      {activeTab === "find" && (
        <FindFriendsSection
          searchQuery={searchQuery}
          onSearchChange={onSearchQueryChange}
          searchResults={searchResults}
          isSearching={isSearchingUsers}
          onSendRequest={onSendRequest}
          isSending={isSendingRequest}
          sendingTargetId={sendingTargetId}
        />
      )}

      {/* Remove Friend Confirmation Dialog */}
      <AlertDialog
        open={Boolean(friendToRemove)}
        onOpenChange={(open) => !open && setFriendToRemove(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Friend</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold text-foreground">
                {friendToRemove?.name}
              </span>{" "}
              from your friends list? You will have to send another request to
              reconnect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (friendToRemove) {
                  onRemoveFriend(friendToRemove.id);
                  setFriendToRemove(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

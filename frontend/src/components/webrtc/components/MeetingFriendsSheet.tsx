import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  useGetFriends,
  useSearchUsers,
  useSendFriendRequest,
} from "@/util/api/api-hooks/use-friends";
import { socket } from "@/util/socket";
import type { FriendUser } from "@/pages/friends/types/friends.types";
import {
  Check,
  Clock,
  Search,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

interface MeetingFriendsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
}

type TabType = "friends" | "add";

export const MeetingFriendsSheet: React.FC<MeetingFriendsSheetProps> = ({
  open,
  onOpenChange,
  roomId,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("friends");
  const [friendFilter, setFriendFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [invitedFriendIds, setInvitedFriendIds] = useState<Set<string>>(
    new Set()
  );

  // Queries & Mutations
  const { data: friends = [], isLoading: isLoadingFriends } = useGetFriends();
  const { data: searchResults, isLoading: isSearchingUsers } = useSearchUsers(
    searchQuery,
    open && activeTab === "add"
  );
  const sendRequestMutation = useSendFriendRequest();
  const [sendingTargetId, setSendingTargetId] = useState<string | null>(null);

  const meetingUrl = `${window.location.origin}/meeting/${roomId}`;

  // Filter friends list locally
  const filteredFriends = friends.filter((f) => {
    if (!friendFilter.trim()) return true;
    const term = friendFilter.toLowerCase();
    return (
      f.friend.fullName.toLowerCase().includes(term) ||
      f.friend.email.toLowerCase().includes(term)
    );
  });

  // Handle inviting a specific friend
  const handleInviteFriend = async (friend: FriendUser) => {
    try {
      // 1. Emit real-time socket invitation event
      if (socket.connected) {
        socket.emit("invite-friend", {
          recipientId: friend._id,
          roomId,
          message: `Join my meeting on MeetUp!`,
        });
      }

      // 2. Also copy tailored invite message to clipboard for easy pasting
      const inviteMsg = `Hey ${friend.fullName || "friend"}, let's talk on MeetUp! Join room: ${meetingUrl}`;
      await navigator.clipboard.writeText(inviteMsg);

      // 3. Mark as invited in local UI state
      setInvitedFriendIds((prev) => new Set(prev).add(friend._id));
      toast.success(
        `Invite sent to ${friend.fullName}! Link copied to clipboard.`
      );

      // Revert invited badge after 5 seconds
      setTimeout(() => {
        setInvitedFriendIds((prev) => {
          const next = new Set(prev);
          next.delete(friend._id);
          return next;
        });
      }, 5000);
    } catch {
      toast.error("Failed to send invite");
    }
  };


  const handleSendRequestToUser = (userId: string) => {
    setSendingTargetId(userId);
    sendRequestMutation.mutate(
      { recipientId: userId },
      {
        onSettled: () => setSendingTargetId(null),
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col bg-white text-slate-900 border-l border-slate-200"
      >
        {/* Header */}
        <SheetHeader className="p-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Users className="w-5 h-5" />
            <SheetTitle className="text-lg font-bold text-slate-900">
              Meeting Friends
            </SheetTitle>
          </div>

          {/* Tabs */}
          <div className="flex  bg-slate-100 rounded-xl mt-3 border border-slate-200/60">
            <button
              onClick={() => setActiveTab("friends")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === "friends"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>My Friends</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                  activeTab === "friends"
                    ? "bg-primary/10 text-primary"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {friends.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("add")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === "add"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add New Friend</span>
            </button>
          </div>
        </SheetHeader>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: MY FRIENDS */}
          {activeTab === "friends" && (
            <div className="space-y-4">
              {/* Filter Friends Input */}
              {friends.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search your friends..."
                    value={friendFilter}
                    onChange={(e) => setFriendFilter(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              )}

              {/* Friends List */}
              {isLoadingFriends ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                  <Spinner className="w-6 h-6 text-primary" />
                  <p className="text-xs">Loading friends...</p>
                </div>
              ) : friends.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    No Friends Yet
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
                    Add your friends so you can invite them directly into meetings with one click.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setActiveTab("add")}
                    className="mt-4 gap-1.5 rounded-xl text-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Find & Add Friends</span>
                  </Button>
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                  No friends matched &quot;{friendFilter}&quot;
                </div>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-slate-500">
                    Select a friend to invite ({filteredFriends.length})
                  </p>

                  {filteredFriends.map((f) => {
                    const friend = f.friend;
                    const isInvited = invitedFriendIds.has(friend._id);
                    const initials = friend.fullName
                      ? friend.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "U";

                    return (
                      <div
                        key={f.friendshipId}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200/80 bg-white hover:border-primary/30 transition-all shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {friend.avatarUrl ? (
                            <img
                              src={friend.avatarUrl}
                              alt={friend.fullName}
                              className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                              {initials}
                            </div>
                          )}

                          <div className="min-w-0">
                            <h5 className="text-sm font-semibold text-slate-800 truncate">
                              {friend.fullName}
                            </h5>
                            <p className="text-xs text-slate-500 truncate">
                              {friend.email}
                            </p>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleInviteFriend(friend)}
                          variant={isInvited ? "outline" : "default"}
                          className={`shrink-0 h-8 gap-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                            isInvited
                              ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                              : ""
                          }`}
                        >
                          {isInvited ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Invited</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Invite</span>
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADD NEW FRIEND */}
          {activeTab === "add" && (
            <div className="space-y-5">
              {/* Search People */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                    Search People on MeetUp
                  </h4>
                  <p className="text-xs text-slate-500">
                    Search by name or email to add new connections.
                  </p>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search people..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Results list */}
                {isSearchingUsers ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
                    <Spinner className="w-5 h-5 text-primary" />
                    <p className="text-xs">Searching users...</p>
                  </div>
                ) : !searchResults || searchResults.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
                    {searchQuery
                      ? `No users matched "${searchQuery}"`
                      : "Type a name or email to search for people."}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map((user) => {
                      const isTargetSending =
                        sendRequestMutation.isPending &&
                        sendingTargetId === user._id;

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
                          className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200/80 bg-white hover:border-primary/30 transition shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={user.fullName}
                                className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                                {initials}
                              </div>
                            )}

                            <div className="min-w-0">
                              <h5 className="text-xs font-semibold text-slate-800 truncate">
                                {user.fullName}
                              </h5>
                              <p className="text-[11px] text-slate-500 truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {user.relationship === "FRIENDS" ? (
                              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                <Check className="w-3 h-3" />
                                Friends
                              </span>
                            ) : user.relationship === "PENDING_OUTGOING" ? (
                              <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                                <Clock className="w-3 h-3" />
                                Sent
                              </span>
                            ) : user.relationship === "PENDING_INCOMING" ? (
                              <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
                                Invited You
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendRequestToUser(user._id)}
                                disabled={isTargetSending}
                                className="h-7 px-2.5 text-xs rounded-lg gap-1 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary"
                              >
                                {isTargetSending ? (
                                  <Spinner className="w-3 h-3" />
                                ) : (
                                  <UserPlus className="w-3 h-3" />
                                )}
                                <span>Add</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

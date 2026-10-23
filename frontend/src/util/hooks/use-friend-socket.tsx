import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { socket } from "@/util/socket";

export const useFriendSocket = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Connect socket if disconnected
    if (!socket.connected) {
      socket.connect();
    }

    const handleRequestReceived = (data: {
      requestId: string;
      requester?: { _id: string; fullName: string; email: string; avatarUrl?: string };
    }) => {
      const name = data.requester?.fullName || "A user";
      toast.success(`${name} sent you a friend request!`, {
        duration: 5000,
      });

      // Instantly refresh queries
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["search-users"] });
      queryClient.invalidateQueries({ queryKey: ["recent-logs"] });
    };

    const handleRequestAccepted = (data: {
      friend?: { _id: string; fullName: string; email: string; avatarUrl?: string };
    }) => {
      const name = data.friend?.fullName || "Your friend";
      toast.success(`${name} accepted your friend request!`, {
        duration: 5000,
      });

      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["search-users"] });
      queryClient.invalidateQueries({ queryKey: ["recent-logs"] });
    };

    const handleRequestDeclined = () => {
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["search-users"] });
    };

    const handleFriendRemoved = () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["search-users"] });
      queryClient.invalidateQueries({ queryKey: ["recent-logs"] });
    };

    const handleMeetingInvite = (data: {
      roomId: string;
      inviter: { id: string; email: string };
      message?: string;
    }) => {
      const inviterName = data.inviter?.email?.split("@")[0] || "A friend";
      toast(
        (t) => (
          <div className="flex flex-col gap-2 min-w-[260px] py-1">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">📹</span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Meeting Invitation
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{inviterName}</span> is inviting you to join a video call!
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1 border-t border-border/40">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg transition"
              >
                Decline
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  window.location.href = `/meeting/${data.roomId}`;
                }}
                className="px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition shadow-xs"
              >
                Join Call
              </button>
            </div>
          </div>
        ),
        {
          duration: 15000,
          position: "top-right",
        }
      );
    };

    socket.on("friend:request_received", handleRequestReceived);
    socket.on("friend:request_accepted", handleRequestAccepted);
    socket.on("friend:request_declined", handleRequestDeclined);
    socket.on("friend:removed", handleFriendRemoved);
    socket.on("meeting:incoming_invite", handleMeetingInvite);

    return () => {
      socket.off("friend:request_received", handleRequestReceived);
      socket.off("friend:request_accepted", handleRequestAccepted);
      socket.off("friend:request_declined", handleRequestDeclined);
      socket.off("friend:removed", handleFriendRemoved);
      socket.off("meeting:incoming_invite", handleMeetingInvite);
    };
  }, [queryClient]);
};

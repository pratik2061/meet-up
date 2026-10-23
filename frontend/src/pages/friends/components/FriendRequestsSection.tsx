import React from "react";
import { FiCheck, FiX, FiClock, FiInbox, FiSend } from "react-icons/fi";
import type { FriendRequestsData } from "../types/friends.types";
import { Spinner } from "@/components/ui/spinner";

interface FriendRequestsSectionProps {
  requestsData?: FriendRequestsData;
  isLoading: boolean;
  onRespond: (requestId: string, status: "ACCEPTED" | "REJECTED") => void;
  onCancelOutgoing: (requestId: string) => void;
  isResponding?: boolean;
  respondingId?: string | null;
}

export const FriendRequestsSection: React.FC<FriendRequestsSectionProps> = ({
  requestsData,
  isLoading,
  onRespond,
  onCancelOutgoing,
  isResponding = false,
  respondingId = null,
}) => {
  const incoming = requestsData?.incoming || [];
  const outgoing = requestsData?.outgoing || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
        <Spinner className="w-7 h-7 text-primary" />
        <p className="text-sm">Loading friend requests...</p>
      </div>
    );
  }

  const hasNoRequests = incoming.length === 0 && outgoing.length === 0;

  if (hasNoRequests) {
    return (
      <div className="bg-card border border-border/70 rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
          <FiInbox className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          No Pending Requests
        </h3>
        <p className="text-sm text-muted-foreground">
          You don't have any incoming or outgoing friend requests at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Incoming Requests */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FiInbox className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Incoming Requests
          </h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            {incoming.length}
          </span>
        </div>

        {incoming.length === 0 ? (
          <div className="bg-muted/30 border border-dashed border-border rounded-xl p-6 text-center text-sm text-muted-foreground">
            No pending incoming requests
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {incoming.map((req) => {
              const requester = req.requester;
              const isActioning = isResponding && respondingId === req._id;
              const initials = requester?.fullName
                ? requester.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "U";

              return (
                <div
                  key={req._id}
                  className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    {requester?.avatarUrl ? (
                      <img
                        src={requester.avatarUrl}
                        alt={requester.fullName}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/20"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm ring-2 ring-primary/20">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-foreground text-sm truncate">
                        {requester?.fullName}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {requester?.email}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                        Sent {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                    <button
                      onClick={() => onRespond(req._id, "ACCEPTED")}
                      disabled={isActioning}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isActioning ? (
                        <Spinner className="w-3 h-3 text-primary-foreground" />
                      ) : (
                        <FiCheck className="w-3.5 h-3.5" />
                      )}
                      <span>Accept</span>
                    </button>

                    <button
                      onClick={() => onRespond(req._id, "REJECTED")}
                      disabled={isActioning}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-medium rounded-xl transition-colors cursor-pointer border border-border/60 disabled:opacity-50"
                    >
                      <FiX className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Outgoing Requests */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FiSend className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">
            Sent Requests (Pending)
          </h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
            {outgoing.length}
          </span>
        </div>

        {outgoing.length === 0 ? (
          <div className="bg-muted/30 border border-dashed border-border rounded-xl p-6 text-center text-sm text-muted-foreground">
            No outgoing requests pending
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {outgoing.map((req) => {
              const recipient = req.recipient;
              const initials = recipient?.fullName
                ? recipient.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "U";

              return (
                <div
                  key={req._id}
                  className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    {recipient?.avatarUrl ? (
                      <img
                        src={recipient.avatarUrl}
                        alt={recipient.fullName}
                        className="w-11 h-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-muted text-muted-foreground font-bold flex items-center justify-center text-sm">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-semibold text-foreground text-sm truncate">
                          {recipient?.fullName}
                        </h4>
                        <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0">
                          <FiClock className="w-2.5 h-2.5" />
                          Pending
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {recipient?.email}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex justify-end">
                    <button
                      onClick={() => onCancelOutgoing(req._id)}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors px-3 py-1.5 rounded-lg hover:bg-destructive/10 cursor-pointer font-medium"
                    >
                      Cancel Request
                    </button>
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

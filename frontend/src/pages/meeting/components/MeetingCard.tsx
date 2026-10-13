import React, { useState } from "react";
import {
  FiVideo,
  FiCopy,
  FiCheck,
  FiClock,
  FiCalendar,
  FiUsers,
  FiBriefcase,
  FiCoffee,
  FiBookOpen,
  FiShare2,
  FiSlash,
  FiXCircle,
  FiTag,
} from "react-icons/fi";
import type { MeetingDetailsResponse } from "../types/meeting-types";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";

interface MeetingCardProps {
  meeting: MeetingDetailsResponse;
  currentUserId?: string;
  onJoin: (roomId: string) => void;
  isJoining?: boolean;
  onCancel?: (roomId: string) => void;
  isCancelling?: boolean;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  currentUserId,
  onJoin,
  isJoining = false,
  onCancel,
  isCancelling = false,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const hostObj =
    typeof meeting.host === "object" && meeting.host !== null
      ? meeting.host
      : null;
  const hostId = hostObj?._id || (typeof meeting.host === "string" ? meeting.host : "");
  const hostName = hostObj?.fullName || hostObj?.email || "Unknown Host";
  const isHost = Boolean(currentUserId && hostId && currentUserId === hostId);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "M";
  };

  const copyRoomCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(meeting.roomId);
    setCopiedCode(true);
    toast.success("Room code copied!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyMeetingLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}/meeting/${meeting.roomId}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success("Meeting link copied!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Format date and time
  const targetDate = meeting.scheduledAt
    ? new Date(meeting.scheduledAt)
    : meeting.createdAt
    ? new Date(meeting.createdAt)
    : null;

  const formatDateDisplay = (date: Date | null) => {
    if (!date || isNaN(date.getTime())) return "Not scheduled";
    try {
      if (isToday(date)) return `Today at ${format(date, "h:mm a")}`;
      if (isTomorrow(date)) return `Tomorrow at ${format(date, "h:mm a")}`;
      if (isYesterday(date)) return `Yesterday at ${format(date, "h:mm a")}`;
      return format(date, "MMM d, yyyy • h:mm a");
    } catch {
      return "Date unavailable";
    }
  };

  // Status badge config
  const status = (meeting.meetingStatus || "scheduled").toLowerCase();
  const isLive = status === "ongoing";
  const isCompleted = status === "completed";
  const isCancelled = status === "cancelled";
  const isScheduled = status === "scheduled";

  const renderStatusBadge = () => {
    switch (status) {
      case "ongoing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Now
          </span>
        );
      case "scheduled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <FiClock className="w-3 h-3 text-purple-600" />
            Scheduled
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  // Meeting Type config
  const renderTypeBadge = () => {
    const type = meeting.meetingType || "casualMeeting";
    switch (type) {
      case "formalMeeting":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
            <FiBriefcase className="w-3 h-3" /> Formal
          </span>
        );
      case "studyMeeting":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
            <FiBookOpen className="w-3 h-3" /> Study
          </span>
        );
      case "casualMeeting":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
            <FiCoffee className="w-3 h-3" /> Casual
          </span>
        );
      case "otherMeeting":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
            <FiTag className="w-3 h-3" /> Other
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md">
            <FiVideo className="w-3 h-3" /> Meeting
          </span>
        );
    }
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-xl border bg-card p-5 text-card-foreground shadow-xs transition-all duration-200 hover:shadow-md hover:border-primary/40 ${
        isLive ? "border-emerald-300 ring-1 ring-emerald-300/40 bg-linear-to-b from-emerald-50/20 to-card" : "border-border"
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {renderTypeBadge()}
            {isHost && (
              <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                You are Host
              </span>
            )}
          </div>
          {renderStatusBadge()}
        </div>

        <div className="flex items-center justify-between bg-muted/40 hover:bg-muted/70 rounded-lg p-2.5 mb-4 border border-border/60 transition-colors">
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Room ID
            </span>
            <span className="font-mono text-sm font-semibold text-foreground truncate select-all">
              {meeting.roomId}
            </span>
          </div>
          <button
            onClick={copyRoomCode}
            type="button"
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-background border border-transparent hover:border-border transition-colors cursor-pointer"
            title="Copy Room ID"
          >
            {copiedCode ? (
              <FiCheck className="w-4 h-4 text-emerald-600" />
            ) : (
              <FiCopy className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="space-y-2.5 text-sm mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FiCalendar className="w-4 h-4 shrink-0 text-primary/70" />
            <span className="font-medium text-foreground">
              {formatDateDisplay(targetDate)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-6 rounded-full bg-primary/15 text-primary text-[11px] font-semibold flex items-center justify-center shrink-0">
                {getInitials(hostName)}
              </div>
              <span className="text-xs text-muted-foreground truncate" title={hostName}>
                {isHost ? "You" : hostName}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FiUsers className="w-3.5 h-3.5" />
              <span>
                {meeting.participants?.length || 0}{" "}
                {meeting.participants?.length === 1 ? "participant" : "participants"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-border/60 flex items-center gap-2">
        {isCancelled ? (
          <button
            disabled
            type="button"
            className="flex-1 py-2.5 px-3 rounded-lg font-medium text-sm bg-muted/60 text-muted-foreground cursor-not-allowed flex items-center justify-center gap-2 border border-border/60"
          >
            <FiSlash className="w-4 h-4 text-rose-500" />
            <span>Meeting Cancelled</span>
          </button>
        ) : (
          <button
            onClick={() => onJoin(meeting.roomId)}
            disabled={isJoining}
            className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              isLive
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-sm"
                : isCompleted
                ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                : "bg-primary hover:bg-primary/90 text-white shadow-xs"
            }`}
          >
            <FiVideo className="w-4 h-4" />
            <span>
              {isLive
                ? "Join Call Now"
                : isCompleted
                ? "Rejoin Meeting"
                : isHost
                ? "Start Meeting"
                : "Join Meeting"}
            </span>
          </button>
        )}

        {isHost && isScheduled && onCancel && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                disabled={isCancelling}
                className="p-2.5 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200/80 transition-colors cursor-pointer disabled:opacity-50"
                title="Cancel Scheduled Meeting"
              >
                {isCancelling ? (
                  <Spinner className="w-4 h-4" />
                ) : (
                  <FiXCircle className="w-4 h-4" />
                )}
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel scheduled meeting?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel the scheduled meeting with Room ID:{" "}
                  <strong className="font-mono text-foreground">{meeting.roomId}</strong>?
                  Participants will no longer be able to join.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Meeting</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onCancel(meeting.roomId)}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 text-white cursor-pointer !bg-red-600 hover:!bg-red-700 !text-white"
                >
                  Yes, Cancel Meeting
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        <button
          onClick={copyMeetingLink}
          type="button"
          className="p-2.5 text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary rounded-lg border border-border/80 transition-colors cursor-pointer"
          title="Share Meeting Link"
        >
          {copiedLink ? (
            <FiCheck className="w-4 h-4 text-emerald-600" />
          ) : (
            <FiShare2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FiVideo,
  FiCopy,
  FiCheck,
  FiClock,
  FiUsers,
  FiShare2,
  FiSlash,
  FiXCircle,
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

interface MeetingTableViewProps {
  meetings: MeetingDetailsResponse[];
  currentUserId?: string;
  onJoin: (roomId: string) => void;
  isJoining?: boolean;
  onCancel?: (roomId: string) => void;
  isCancelling?: boolean;
  cancellingRoomId?: string | null;
}

export const MeetingTableView: React.FC<MeetingTableViewProps> = ({
  meetings,
  currentUserId,
  onJoin,
  isJoining = false,
  onCancel,
  isCancelling = false,
  cancellingRoomId = null,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCode = (roomId: string) => {
    navigator.clipboard.writeText(roomId);
    setCopiedId(roomId);
    toast.success("Room code copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyLink = (roomId: string) => {
    const link = `${window.location.origin}/meeting/${roomId}`;
    navigator.clipboard.writeText(link);
    toast.success("Meeting link copied!");
  };

  const formatDateDisplay = (dateStr?: string | Date) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "—";
    try {
      if (isToday(date)) return `Today at ${format(date, "h:mm a")}`;
      if (isTomorrow(date)) return `Tomorrow at ${format(date, "h:mm a")}`;
      if (isYesterday(date)) return `Yesterday at ${format(date, "h:mm a")}`;
      return format(date, "MMM d, yyyy • h:mm a");
    } catch {
      return "—";
    }
  };

  const renderStatus = (statusStr: string) => {
    const status = (statusStr || "scheduled").toLowerCase();
    switch (status) {
      case "ongoing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live
          </span>
        );
      case "scheduled":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <FiClock className="w-3 h-3 text-purple-600" />
            Scheduled
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              Room ID
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              Host
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              Date & Time
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              Type
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              Participants
            </TableHead>
            <TableHead className="text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meetings.map((meeting) => {
            const hostObj =
              typeof meeting.host === "object" && meeting.host !== null
                ? meeting.host
                : null;
            const hostId = hostObj?._id || (typeof meeting.host === "string" ? meeting.host : "");
            const hostName = hostObj?.fullName || hostObj?.email || "Unknown Host";
            const isHost = Boolean(currentUserId && hostId && currentUserId === hostId);
            const isLive = (meeting.meetingStatus || "").toLowerCase() === "ongoing";
            const isCompleted = (meeting.meetingStatus || "").toLowerCase() === "completed";
            const isCancelled = (meeting.meetingStatus || "").toLowerCase() === "cancelled";
            const isScheduled = (meeting.meetingStatus || "").toLowerCase() === "scheduled";
            const isRowCancelling = isCancelling && cancellingRoomId === meeting.roomId;

            return (
              <TableRow
                key={meeting._id || meeting.roomId}
                className="hover:bg-muted/30 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-foreground select-all">
                      {meeting.roomId}
                    </span>
                    <button
                      onClick={() => copyCode(meeting.roomId)}
                      type="button"
                      className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors cursor-pointer"
                      title="Copy Room ID"
                    >
                      {copiedId === meeting.roomId ? (
                        <FiCheck className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <FiCopy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">
                      {isHost ? "You" : hostName}
                    </span>
                    {isHost && (
                      <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-sm">
                        Host
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-xs text-muted-foreground">
                  {formatDateDisplay(meeting.scheduledAt || meeting.createdAt)}
                </TableCell>

                <TableCell>{renderStatus(meeting.meetingStatus)}</TableCell>

                <TableCell>
                  <span className="text-xs capitalize text-muted-foreground">
                    {meeting.meetingType
                      ? meeting.meetingType.replace("Meeting", "")
                      : "General"}
                  </span>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FiUsers className="w-3.5 h-3.5" />
                    <span>{meeting.participants?.length || 0}</span>
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => copyLink(meeting.roomId)}
                      type="button"
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors cursor-pointer"
                      title="Copy meeting link"
                    >
                      <FiShare2 className="w-3.5 h-3.5" />
                    </button>

                    {isHost && isScheduled && onCancel && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            type="button"
                            disabled={isRowCancelling}
                            className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                            title="Cancel Scheduled Meeting"
                          >
                            {isRowCancelling ? (
                              <Spinner className="w-3.5 h-3.5" />
                            ) : (
                              <FiXCircle className="w-3.5 h-3.5" />
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

                    {isCancelled ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground border border-border/60">
                        <FiSlash className="w-3 h-3 text-rose-500" />
                        Cancelled
                      </span>
                    ) : (
                      <button
                        onClick={() => onJoin(meeting.roomId)}
                        disabled={isJoining}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          isLive
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : isCompleted
                            ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            : "bg-primary hover:bg-primary/90 text-white"
                        }`}
                      >
                        <FiVideo className="w-3.5 h-3.5" />
                        <span>{isLive ? "Join Call" : isCompleted ? "Rejoin" : "Join"}</span>
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

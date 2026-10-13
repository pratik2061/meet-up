"use client"

import * as React from "react"
import {
  Clock2Icon,
  CopyIcon,
  CheckIcon,
  CalendarIcon,
  ArrowRightIcon,
  VideoIcon,
} from "lucide-react"
import { FiVideo } from "react-icons/fi"
import { Calendar } from "@/components/ui/calendar"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateMeeting } from "@/util/api/api-hooks/use-meeting"
import type { MeetingDetailsResponse } from "../types/meeting-types"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

const MEETING_TYPES = [
  { value: "casualMeeting", label: "Casual Meeting" },
  { value: "formalMeeting", label: "Formal Meeting" },
  { value: "studyMeeting", label: "Study Meeting" },
  { value: "otherMeeting", label: "Other Meeting" },
] as const;

export default function MeetingScheduleCalender() {
  const navigate = useNavigate();
  const [date, setDate] = React.useState<Date | undefined>(() => new Date());

  // Dynamic default times (next hour start, +1h end)
  const getInitialTimes = () => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(now.getHours() + 1, 0, 0, 0);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    const pad = (n: number) => n.toString().padStart(2, "0");
    return {
      start: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
      end: `${pad(end.getHours())}:${pad(end.getMinutes())}`,
    };
  };

  const initialTimes = React.useMemo(() => getInitialTimes(), []);
  const [startTime, setStartTime] = React.useState<string>(initialTimes.start);
  const [endTime, setEndTime] = React.useState<string>(initialTimes.end);
  const [meetingType, setMeetingType] = React.useState<string>("casualMeeting");

  const [createdMeeting, setCreatedMeeting] = React.useState<MeetingDetailsResponse | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = React.useState<boolean>(false);
  const [copiedLink, setCopiedLink] = React.useState<boolean>(false);

  const { mutateAsync: createMeetingMutation, isPending } = useCreateMeeting();

  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    // If endTime is before or equal to newStart, push endTime 1 hour forward
    if (endTime <= newStart) {
      const [h, m] = newStart.split(":").map(Number);
      const nextH = (h + 1) % 24;
      const pad = (n: number) => n.toString().padStart(2, "0");
      setEndTime(`${pad(nextH)}:${pad(m || 0)}`);
    }
  };

  const handleSchedule = async () => {
    if (!date) {
      toast.error("Please pick a date for the meeting.");
      return;
    }

    if (!startTime) {
      toast.error("Please select a start time.");
      return;
    }

    const [hours, minutes] = startTime.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      toast.error("Please provide a valid start time.");
      return;
    }

    const scheduledDate = new Date(date);
    scheduledDate.setHours(hours, minutes, 0, 0);

    // Guard against scheduling in the past (allow 60 seconds grace period)
    if (scheduledDate.getTime() < Date.now() - 60 * 1000) {
      toast.error("Please select a future date and time for the meeting.");
      return;
    }

    try {
      const res = await createMeetingMutation({
        meetingType,
        meetingStatus: "scheduled",
        scheduledAt: scheduledDate.toISOString(),
      });

      if (res?.meetingData) {
        setCreatedMeeting(res.meetingData);
        setIsSuccessOpen(true);
        toast.success("Meeting scheduled successfully!");
      }
    } catch {
      // Error handled by mutation onError
    }
  };

  const copyMeetingLink = () => {
    if (!createdMeeting?.roomId) return;
    const link = `${window.location.origin}/meeting/${createdMeeting.roomId}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success("Meeting link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Compute today at midnight for disabling past days
  const today = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  return (
    <div className="w-full space-y-4">
      {/* Calendar & Time inputs container */}
      <div className="bg-muted/20 border border-border/70 rounded-xl p-3 space-y-3.5">
        {/* Calendar View */}
        <div className="w-full flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={{ before: today }}
            className="w-full p-1"
            classNames={{
              root: "w-full",
              months: "relative w-full flex flex-col gap-3",
              month: "w-full flex flex-col gap-3",
            }}
          />
        </div>

        {/* Meeting Type Selector */}
        <div className="pt-2 border-t border-border/80 space-y-1.5">
          <label className="text-xs font-medium text-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <VideoIcon className="size-4 text-primary" />
              <span>Meeting Type</span>
            </span>
          </label>
          <Select value={meetingType} onValueChange={(val) => setMeetingType(val || "casualMeeting")}>
            <SelectTrigger className="w-full h-9 text-xs bg-background">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {MEETING_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value} className="text-xs">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Time Pickers */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/80">
          <div className="space-y-1.5">
            <label
              htmlFor="time-from"
              className="text-xs font-medium text-foreground flex items-center gap-1.5"
            >
              <Clock2Icon className="size-3.5 text-primary" />
              <span>Start Time</span>
            </label>
            <div className="flex items-center border border-border rounded-lg px-3 py-2 bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <input
                id="time-from"
                type="time"
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="w-full text-xs bg-transparent outline-none text-foreground font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="time-to"
              className="text-xs font-medium text-foreground flex items-center gap-1.5"
            >
              <Clock2Icon className="size-3.5 text-primary" />
              <span>End Time</span>
            </label>
            <div className="flex items-center border border-border rounded-lg px-3 py-2 bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <input
                id="time-to"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs bg-transparent outline-none text-foreground font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Button */}
      <button
        type="button"
        onClick={handleSchedule}
        disabled={isPending || !date}
        className="w-full py-3 px-4 bg-primary hover:bg-primary/90 hover:cursor-pointer text-white font-medium rounded-xl transition-all text-sm shadow-xs hover:shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Spinner className="size-4" />
            <span>Scheduling Meeting...</span>
          </>
        ) : (
          <>
            <FiVideo className="w-4 h-4" />
            <span>Schedule Now</span>
          </>
        )}
      </button>

      {/* Success Modal */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="w-[95vw] sm:w-[90vw] md:w-full md:max-w-xl lg:max-w-2xl p-6 sm:p-7">
          <DialogHeader>
            <div className="size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 mx-auto sm:mx-0">
              <CalendarIcon className="size-5" />
            </div>
            <DialogTitle className="text-xl font-semibold text-foreground">
              Meeting Scheduled!
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Your meeting has been created and scheduled. You can copy the link now or share it with participants.
            </DialogDescription>
          </DialogHeader>

          {createdMeeting && (
            <div className="space-y-4 my-2">
              {/* Meeting Info Card */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-2.5 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                  <span className="text-muted-foreground font-medium shrink-0">Scheduled For:</span>
                  <span className="font-semibold text-foreground sm:text-right">
                    {createdMeeting.scheduledAt
                      ? format(new Date(createdMeeting.scheduledAt), "EEE, MMM d, yyyy • h:mm a")
                      : "Today"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                  <span className="text-muted-foreground font-medium shrink-0">Meeting Type:</span>
                  <span className="capitalize font-semibold text-primary sm:text-right">
                    {createdMeeting.meetingType?.replace("Meeting", " Meeting") || "Casual"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                  <span className="text-muted-foreground font-medium shrink-0">Room ID:</span>
                  <span className="font-mono text-foreground font-medium select-all break-all sm:break-normal sm:text-right">
                    {createdMeeting.roomId}
                  </span>
                </div>
              </div>

              {/* Shareable Link Box */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">
                  Meeting Link
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3.5 py-2.5 rounded-lg bg-background border border-border text-xs sm:text-sm text-foreground/90 font-mono select-all overflow-x-auto whitespace-nowrap scrollbar-none">
                    {`${window.location.origin}/meeting/${createdMeeting.roomId}`}
                  </div>
                  <button
                    type="button"
                    onClick={copyMeetingLink}
                    className="p-2.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                    title="Copy Link"
                  >
                    {copiedLink ? (
                      <CheckIcon className="size-4 text-emerald-600" />
                    ) : (
                      <CopyIcon className="size-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4 sm:justify-end">
            <button
              type="button"
              onClick={() => setIsSuccessOpen(false)}
              className="w-full sm:w-auto px-5 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
            >
              Done
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSuccessOpen(false);
                if (createdMeeting?.roomId) {
                  navigate(`/meeting/${createdMeeting.roomId}`);
                }
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Join Room</span>
              <ArrowRightIcon className="size-4" />
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client"

import * as React from "react"
import { Clock2Icon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"

export default function MeetingScheduleCalender() {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 18)
  )

  return (
    <div className="w-full space-y-4">
      {/* Calendar View */}
      <div className="w-full flex justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="w-full p-1"
          classNames={{
            root: "w-full",
            months: "w-full flex flex-col gap-3",
            month: "w-full flex flex-col gap-3",
          }}
        />
      </div>

      {/* Time Pickers */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/80">
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
              step="1"
              defaultValue="10:30:00"
              className="w-full text-xs bg-transparent outline-none text-foreground font-medium appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
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
              step="1"
              defaultValue="12:30:00"
              className="w-full text-xs bg-transparent outline-none text-foreground font-medium appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

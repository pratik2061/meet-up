import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ReportDateRangeFilterProps {
  date?: DateRange;
  onDateChange: (date: DateRange | undefined) => void;
  disabled?: boolean;
}

export function ReportDateRangeFilter({
  date,
  onDateChange,
  disabled = false,
}: ReportDateRangeFilterProps) {
  return (
    <Field className="w-auto">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date-picker-range"
            disabled={disabled}
            className="justify-start px-3 font-normal text-sm h-9 hover:bg-muted/60 transition-colors cursor-pointer"
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            {date?.from ? (
              date.to ? (
                <span>
                  {format(date.from, "LLL dd, y")} –{" "}
                  {format(date.to, "LLL dd, y")}
                </span>
              ) : (
                <span>{format(date.from, "LLL dd, y")}</span>
              )
            ) : (
              <span className="text-muted-foreground">Select date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            defaultMonth={date?.from || new Date()}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}

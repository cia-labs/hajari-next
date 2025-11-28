"use client"

import { DateRange } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

export function CalendarDateRangePicker({
  value,
  onChange,
}: {
  value: DateRange | null
  onChange: (range: DateRange | null) => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="text-sm">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from && value?.to ? (
            <>
              {format(value.from, "dd MMM")} – {format(value.to, "dd MMM yyyy")}
            </>
          ) : (
            <>Pick Date Range</>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={new Date()}
          selected={value}
          onSelect={onChange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}

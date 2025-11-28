"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { useTheme } from "next-themes"

export interface CalendarProps 
  extends React.ComponentProps<typeof DayPicker> {}

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"
  
  const blueColor = "#4339F2" 
  const greenColor = "#00D15B" 
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-4 rounded-lg shadow-sm", 
        isDarkMode 
          ? "bg-[#191919] text-white border border-[#333742]/30" 
          : "bg-white text-[#333742] border border-slate-200",
        className
      )}
      classNames={{

        months: "flex flex-col sm:flex-row gap-3",
        month: "flex flex-col gap-3",
        month_caption: "flex justify-center py-2 relative items-center w-full",
        caption_label: cn(
          "text-sm font-medium",
          isDarkMode ? "text-[#00D15B]" : "text-[#4339F2]"
        ),
        
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 bg-transparent p-0 rounded-full transition-colors duration-200 absolute left-1",
          isDarkMode 
            ? "text-[#00D15B] hover:bg-[#333742] hover:opacity-90" 
            : "text-[#4339F2] hover:bg-slate-100"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 bg-transparent p-0 rounded-full transition-colors duration-200 absolute right-1",
          isDarkMode 
            ? "text-[#00D15B] hover:bg-[#333742] hover:opacity-90" 
            : "text-[#4339F2] hover:bg-slate-100"
        ),
        chevron: "size-4",
        
        // grid
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: cn(
          "w-9 font-normal text-xs uppercase",
          isDarkMode ? "text-white/60" : "text-[#333742]/60"
        ),
        week: "flex w-full mt-1",
        
        day: cn(
          "relative p-0 text-center text-sm focus-within:z-20",
          isDarkMode 
            ? "[&:has([aria-selected])]:bg-[#333742]" 
            : "[&:has([aria-selected])]:bg-slate-100",
          "[&:has([aria-selected].range_end)]:rounded-r-md",
          "[&:has([aria-selected].range_start)]:rounded-l-md"
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 p-0 font-normal rounded-full transition-colors duration-200",
          isDarkMode 
            ? "text-white hover:bg-[#333742]/40 hover:text-[#00D15B] focus:bg-[#333742] focus:text-[#00D15B]" 
            : "text-[#333742] hover:bg-slate-100 hover:text-[#4339F2] focus:bg-slate-100 focus:text-[#4339F2]"
        ),
        
        selected: cn(
          isDarkMode 
            ? "bg-[#333742] text-[#00D15B] hover:bg-[#333742] hover:text-[#00D15B]" 
            : "bg-slate-100 text-[#4339F2] hover:bg-slate-100 hover:text-[#4339F2]"
        ),
        range_start: cn(
          "range_start",
          isDarkMode 
            ? "aria-selected:bg-[#333742] aria-selected:text-[#00D15B]" 
            : "aria-selected:bg-slate-100 aria-selected:text-[#4339F2]"
        ),
        range_end: cn(
          "range_end",
          isDarkMode 
            ? "aria-selected:bg-[#333742] aria-selected:text-[#00D15B]" 
            : "aria-selected:bg-slate-100 aria-selected:text-[#4339F2]"
        ),
        range_middle: cn(
          isDarkMode 
            ? "aria-selected:bg-[#333742]/60 aria-selected:text-white" 
            : "aria-selected:bg-slate-100/60 aria-selected:text-[#333742]"
        ),
        today: cn(
          "border",
          isDarkMode 
            ? "border-[#00D15B]/50 text-[#00D15B]" 
            : "border-[#4339F2]/50 text-[#4339F2]"
        ),
        outside: cn(
          isDarkMode 
            ? "text-white/30 aria-selected:text-white/30" 
            : "text-[#333742]/30 aria-selected:text-[#333742]/30"
        ),
        disabled: cn(
          isDarkMode ? "text-white/20 opacity-50" : "text-[#333742]/20 opacity-50"
        ),
        hidden: "invisible",
        
        // allow user overrides
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className, ...props }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("size-4", className)} {...props} />
          ) : (
            <ChevronRight className={cn("size-4", className)} {...props} />
          ),
      }}
      {...props}
    />
  )
}
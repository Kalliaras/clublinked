"use client"

import * as React from "react"

import { cn } from "@/lib/utils/tailwind"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type CalendarEvent = {
  id: string
  title: string | null
  description: string | null
  time: string
}

interface CalendarProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultMonth?: Date
  eventsByDay?: Map<string, CalendarEvent[]>
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const EVENT_BADGE_LIMIT = 16

function truncateTitle(title: string) {
  return title.length > EVENT_BADGE_LIMIT
    ? `${title.slice(0, EVENT_BADGE_LIMIT - 1).trimEnd()}…`
    : title
}

function getMonthDays(month: number, year: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const dayOffset = firstDay.getDay()

  const cells: Array<{ date: Date | null }> = []
  for (let i = 0; i < dayOffset; i += 1) {
    cells.push({ date: null })
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: new Date(year, month, day) })
  }
  while (cells.length % 7 !== 0) {
    cells.push({ date: null })
  }

  return cells
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function Calendar({
  className,
  defaultMonth,
  eventsByDay,
  ...props
}: CalendarProps) {
  const [month, setMonth] = React.useState(defaultMonth ?? new Date())

  const monthName = month.toLocaleString("default", { month: "long" })
  const year = month.getFullYear()

  const cells = React.useMemo(
    () => getMonthDays(month.getMonth(), month.getFullYear()),
    [month]
  )

  const handlePreviousMonth = () => {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
  }

  return (
    <div
      data-slot="calendar"
      className={cn(
        "bg-card text-card-foreground rounded-2xl border border-slate-200 shadow-sm",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-4 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-500">Calendar</p>
            <h2 className="text-2xl font-semibold text-slate-900">
              {monthName} {year}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handlePreviousMonth}>
              Prev
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleNextMonth}>
              Next
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 rounded-3xl bg-slate-100 p-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {cells.map((cell, index) => {
            const date = cell.date
            const dateKey = date ? formatDateKey(date) : ""
            const dayEvents = date ? eventsByDay?.get(dateKey) ?? [] : []

            return (
              <div
                key={index}
                className={cn(
                  "min-h-[96px] rounded-3xl border border-slate-200 bg-white p-3",
                  date ? "" : "bg-slate-50"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={cn("text-sm font-semibold text-slate-900", date ? "" : "text-slate-400")}>
                    {date?.getDate() ?? ""}
                  </span>
                </div>

                {dayEvents.length > 0 ? (
                  <div className="mt-3 flex flex-col gap-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <Popover key={event.id}>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="w-full rounded-full bg-sky-600 px-2 py-1 text-[10px] font-semibold text-white shadow-sm transition hover:bg-sky-500 text-left"
                          >
                            {truncateTitle(event.title ?? "Untitled")}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72">
                          <p className="text-sm font-semibold text-slate-900">
                            {event.title ?? "Untitled event"}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {event.description ?? "No description provided."}
                          </p>
                          <p className="mt-3 text-xs text-slate-500">
                            Starts {new Date(event.time).toLocaleString()}
                          </p>
                        </PopoverContent>
                      </Popover>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[10px] text-slate-500">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function CalendarDayButton() {
  return null
}

export { Calendar, CalendarDayButton }

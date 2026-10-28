import type { ComponentProps } from 'react'
import type { DateRange } from 'react-day-picker'
import { ChevronDownIcon } from 'lucide-react'

import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { monthLabel, toISODate } from '@/lib/stay-calendar'

interface RatesCalendarProps {
  month: Date
  months: Date[]
  onMonthChange: (month: Date) => void
  selected: DateRange | undefined
  onRangeSelect: (range: DateRange | undefined) => void
  disabled: (date: Date) => boolean
  booked: (date: Date) => boolean
}

function RateDayButton({
  day,
  modifiers,
  className,
  ...props
}: ComponentProps<typeof CalendarDayButton>) {
  const taken = Boolean(modifiers.booked) && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle
  const closed = Boolean(modifiers.disabled) || taken
  const priceLabel = closed ? 'Unavailable' : 'Open'
  const ariaLabel = typeof props['aria-label'] === 'string' ? props['aria-label'] : undefined

  return (
    <CalendarDayButton
      day={day}
      modifiers={modifiers}
      className={taken ? `${className || ''} day-booked` : className}
      {...props}
      aria-label={ariaLabel ? `${ariaLabel}, ${priceLabel}` : priceLabel}
    >
      <span className="rate-num">{day.date.getDate()}</span>
      <span className="rate-price">{closed ? 'Closed' : ''}</span>
    </CalendarDayButton>
  )
}

export function RatesCalendar({
  month,
  months,
  onMonthChange,
  selected,
  onRangeSelect,
  disabled,
  booked,
}: RatesCalendarProps) {
  const monthIndex = months.findIndex(
    (item) => item.getFullYear() === month.getFullYear() && item.getMonth() === month.getMonth(),
  )
  const startMonth = months[0] ?? month
  const endMonth = months[months.length - 1] ?? month

  return (
    <div className="rates-calendar">
      <div className="calendar-controls">
        <DropdownMenu>
          <DropdownMenuTrigger className="month-heading month-picker" type="button">
            {monthLabel(month)}
            <ChevronDownIcon className="month-picker-icon" strokeWidth={1.75} aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" sideOffset={8}>
            <DropdownMenuRadioGroup
              value={String(Math.max(monthIndex, 0))}
              onValueChange={(value) => {
                const next = months[Number(value)]
                if (next) onMonthChange(next)
              }}
            >
              {months.map((item, index) => (
                <DropdownMenuRadioItem key={toISODate(item)} value={String(index)}>
                  {monthLabel(item)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="month-nav">
          <button
            className="month-nav-btn"
            disabled={monthIndex <= 0}
            onClick={() => {
              const next = months[monthIndex - 1]
              if (next) onMonthChange(next)
            }}
            aria-label="Previous month"
            type="button"
          >
            ← Prev
          </button>
          <button
            className="month-nav-btn"
            disabled={monthIndex < 0 || monthIndex >= months.length - 1}
            onClick={() => {
              const next = months[monthIndex + 1]
              if (next) onMonthChange(next)
            }}
            aria-label="Next month"
            type="button"
          >
            Next →
          </button>
        </div>
      </div>

      <Calendar
        mode="range"
        resetOnSelect
        selected={selected}
        onSelect={onRangeSelect}
        month={month}
        onMonthChange={(date) => onMonthChange(new Date(date.getFullYear(), date.getMonth(), 1))}
        startMonth={startMonth}
        endMonth={endMonth}
        disabled={disabled}
        modifiers={{ booked }}
        showOutsideDays={false}
        hideNavigation
        formatters={{
          formatWeekdayName: (date) => date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        }}
        className="rates-daypicker"
        components={{ DayButton: RateDayButton }}
      />
    </div>
  )
}

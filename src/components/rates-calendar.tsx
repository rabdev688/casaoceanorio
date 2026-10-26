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
import {
  calendarMonths,
  dateToSelection,
  isBlockedDate,
  monthStart,
  selectionToDate,
  type StaySelection,
} from '@/lib/stay-calendar'

interface RatesCalendarProps {
  monthIdx: number
  onMonthIdxChange: (monthIdx: number) => void
  selectedStart: StaySelection | null
  selectedEnd: StaySelection | null
  onRangeSelect: (range: DateRange | undefined) => void
}

function RateDayButton({
  day,
  modifiers,
  className,
  ...props
}: ComponentProps<typeof CalendarDayButton>) {
  const blocked = Boolean(modifiers.disabled)
  const priceLabel = blocked ? 'Unavailable' : 'Open'
  const ariaLabel = typeof props['aria-label'] === 'string' ? props['aria-label'] : undefined

  return (
    <CalendarDayButton
      day={day}
      modifiers={modifiers}
      className={className}
      {...props}
      aria-label={ariaLabel ? `${ariaLabel}, ${priceLabel}` : priceLabel}
    >
      <span className="rate-num">{day.date.getDate()}</span>
      <span className="rate-price">{blocked ? '—' : ''}</span>
    </CalendarDayButton>
  )
}

export function RatesCalendar({
  monthIdx,
  onMonthIdxChange,
  selectedStart,
  selectedEnd,
  onRangeSelect,
}: RatesCalendarProps) {
  const month = calendarMonths[monthIdx]
  const from = selectionToDate(selectedStart)
  const to = selectionToDate(selectedEnd)
  const selected = from ? { from, to } : undefined

  return (
    <div className="rates-calendar">
      <div className="calendar-controls">
        <DropdownMenu>
          <DropdownMenuTrigger className="month-heading month-picker" type="button">
            {month.name} {month.year}
            <ChevronDownIcon className="month-picker-icon" strokeWidth={1.75} aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" sideOffset={8}>
            <DropdownMenuRadioGroup
              value={String(monthIdx)}
              onValueChange={(value) => onMonthIdxChange(Number(value))}
            >
              {calendarMonths.map((item, index) => (
                <DropdownMenuRadioItem key={item.name} value={String(index)}>
                  {item.name} {item.year}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="month-nav">
          <button
            className="month-nav-btn"
            disabled={monthIdx === 0}
            onClick={() => onMonthIdxChange(Math.max(0, monthIdx - 1))}
            aria-label="Previous month"
            type="button"
          >
            ← Prev
          </button>
          <button
            className="month-nav-btn"
            disabled={monthIdx === calendarMonths.length - 1}
            onClick={() => onMonthIdxChange(Math.min(calendarMonths.length - 1, monthIdx + 1))}
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
        month={monthStart(monthIdx)}
        onMonthChange={(date) => {
          const selection = dateToSelection(date)
          if (selection) onMonthIdxChange(selection.monthIdx)
        }}
        startMonth={monthStart(0)}
        endMonth={monthStart(calendarMonths.length - 1)}
        disabled={isBlockedDate}
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

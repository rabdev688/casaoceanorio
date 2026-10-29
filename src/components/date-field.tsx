import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { RateDayButton } from '@/components/rates-calendar'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { parseISODate, toISODate } from '@/lib/stay-calendar'
import { todayInTimeZone } from '../../server/dates.js'

interface DateFieldProps {
  id: string
  value: string
  onChange: (value: string) => void | boolean
  placeholder?: string
  invalid?: boolean
  disabled?: (date: Date) => boolean
  booked?: (date: Date) => boolean
  startMonth?: Date
  endMonth?: Date
}

function currentMonth() {
  const today = todayInTimeZone()
  const [year, month] = today.split('-').map(Number)
  return new Date(year, month - 1, 1)
}

export function DateField({
  id,
  value,
  onChange,
  placeholder = 'Select date',
  invalid = false,
  disabled,
  booked,
  startMonth,
  endMonth,
}: DateFieldProps) {
  const [open, setOpen] = useState(false)
  const selected = parseISODate(value)
  const [month, setMonth] = useState<Date>(selected ?? currentMonth())

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setMonth(selected ?? startMonth ?? currentMonth())
      }}
    >
      <PopoverTrigger
        id={id}
        type="button"
        className="date-field-trigger"
        data-empty={selected ? undefined : true}
        aria-invalid={invalid || undefined}
      >
        <span>{selected ? format(selected, 'MMM d, yyyy') : placeholder}</span>
        <CalendarIcon className="date-field-icon" strokeWidth={1.75} aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8} className="date-popover">
        <Calendar
          mode="single"
          selected={selected}
          month={month}
          onMonthChange={setMonth}
          startMonth={startMonth}
          endMonth={endMonth}
          disabled={disabled}
          modifiers={booked ? { booked } : undefined}
          components={booked ? { DayButton: RateDayButton } : undefined}
          onSelect={(date) => {
            if (!date) return
            if (onChange(toISODate(date)) === false) return
            setOpen(false)
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

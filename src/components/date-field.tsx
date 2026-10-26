import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { parseISODate, toISODate } from '@/lib/stay-calendar'

interface DateFieldProps {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  invalid?: boolean
}

export function DateField({ id, value, onChange, placeholder = 'Select date', invalid = false }: DateFieldProps) {
  const [open, setOpen] = useState(false)
  const selected = parseISODate(value)
  const [month, setMonth] = useState<Date>(selected ?? new Date(2026, 5, 1))

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setMonth(selected ?? new Date(2026, 5, 1))
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
          onSelect={(date) => {
            if (!date) return
            onChange(toISODate(date))
            setOpen(false)
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

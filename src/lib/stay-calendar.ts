export interface StayMonth {
  name: string
  year: number
  daysInMonth: number
  firstDayOffset: number
  blocked: number[]
  rates: number[]
}

export interface StaySelection {
  monthIdx: number
  day: number
}

const MONTH_INDEX: Record<string, number> = {
  May: 4,
  June: 5,
  July: 6,
  August: 7,
}

export const calendarMonths: StayMonth[] = [
  {
    name: 'May',
    year: 2026,
    daysInMonth: 31,
    firstDayOffset: 5,
    blocked: [1, 2, 8, 9, 15, 16, 22, 23, 24, 25],
    rates: Array.from({ length: 31 }, (_, i) => ([0, 5, 6].includes((i + 5) % 7) ? 585 : 520)),
  },
  {
    name: 'June',
    year: 2026,
    daysInMonth: 30,
    firstDayOffset: 1,
    blocked: [5, 6, 7, 13, 14, 20, 21, 27, 28],
    rates: Array.from({ length: 30 }, (_, i) => ([0, 5, 6].includes((i + 1) % 7) ? 680 : 610)),
  },
  {
    name: 'July',
    year: 2026,
    daysInMonth: 31,
    firstDayOffset: 3,
    blocked: [2, 3, 4, 5, 11, 12, 18, 19, 25, 26],
    rates: Array.from({ length: 31 }, (_, i) => ([0, 5, 6].includes((i + 3) % 7) ? 720 : 640)),
  },
  {
    name: 'August',
    year: 2026,
    daysInMonth: 31,
    firstDayOffset: 6,
    blocked: [1, 2, 7, 8, 14, 15, 21, 22],
    rates: Array.from({ length: 31 }, (_, i) => ([0, 5, 6].includes((i + 6) % 7) ? 620 : 550)),
  },
]

export function monthStart(monthIdx: number) {
  const month = calendarMonths[monthIdx]
  return new Date(month.year, MONTH_INDEX[month.name], 1)
}

function monthIndexForDate(date: Date) {
  return calendarMonths.findIndex((month) => {
    return month.year === date.getFullYear() && MONTH_INDEX[month.name] === date.getMonth()
  })
}

export function dateToSelection(date: Date): StaySelection | null {
  const monthIdx = monthIndexForDate(date)
  if (monthIdx < 0) return null
  return { monthIdx, day: date.getDate() }
}

export function selectionToDate(selection: StaySelection | null | undefined) {
  if (!selection) return undefined
  const month = calendarMonths[selection.monthIdx]
  if (!month) return undefined
  return new Date(month.year, MONTH_INDEX[month.name], selection.day)
}

export function isBlockedDate(date: Date) {
  const monthIdx = monthIndexForDate(date)
  if (monthIdx < 0) return true
  return calendarMonths[monthIdx].blocked.includes(date.getDate())
}

export function getStayRate(date: Date) {
  const monthIdx = monthIndexForDate(date)
  if (monthIdx < 0) return null
  return calendarMonths[monthIdx].rates[date.getDate() - 1] ?? null
}

export function toISODate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseISODate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return undefined
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return undefined
  }
  return date
}

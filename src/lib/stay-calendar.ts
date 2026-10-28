import { horizonCheckout, todayInTimeZone } from '../../server/dates.js'

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
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return undefined
  return date
}

export function monthStarts(today = todayInTimeZone()) {
  const end = horizonCheckout(today)
  const [startYear, startMonth] = today.split('-').map(Number)
  const [endYear, endMonth] = end.split('-').map(Number)
  const months: Date[] = []
  let year = startYear
  let month = startMonth
  while (year < endYear || (year === endYear && month <= endMonth)) {
    months.push(new Date(year, month - 1, 1))
    month += 1
    if (month === 13) {
      month = 1
      year += 1
    }
  }
  return months
}

export function monthLabel(date: Date) {
  return `${date.toLocaleString('en-US', { month: 'long' })} ${date.getFullYear()}`
}

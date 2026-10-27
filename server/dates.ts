export const VRBO_LISTING = '294715'
export const PROPERTY_ADDRESS = '1811a Butler Ave, Tybee Island, Ga 31328'
export const WILLIE_PHONE = '(912) 398-4113'
export const SHELLY_PHONE = '(912) 398-6901'
export const TIMEZONE = 'America/New_York'
export const HORIZON_MONTHS = 18
export const SYNC_MAX_AGE_MS = 15 * 60 * 1000
export const MAX_GUESTS = 16

export function todayInTimeZone(now = new Date(), timeZone = TIMEZONE): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function addDays(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + days))
  return date.toISOString().slice(0, 10)
}

export function horizonCheckout(todayIso: string): string {
  const [year, month] = todayIso.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1 + HORIZON_MONTHS, 1))
  return date.toISOString().slice(0, 10)
}

export function rangesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  return startA < endB && startB < endA
}

export function eachNight(checkIn: string, checkOut: string): string[] {
  const nights: string[] = []
  let cursor = checkIn
  while (cursor < checkOut && nights.length < 400) {
    nights.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return nights
}

export function nightCount(checkIn: string, checkOut: string): number {
  if (!isIsoDate(checkIn) || !isIsoDate(checkOut) || checkOut <= checkIn) return 0
  const start = Date.parse(`${checkIn}T00:00:00Z`)
  const end = Date.parse(`${checkOut}T00:00:00Z`)
  return Math.round((end - start) / 86400000)
}

export function formatLongDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(Date.UTC(year, month - 1, day)))
}

export function validateStayDates(checkIn: string, checkOut: string, today: string): string | null {
  if (!isIsoDate(checkIn) || !isIsoDate(checkOut)) return 'Check-in and check-out must be real dates.'
  if (checkOut <= checkIn) return 'Check-out date must be after check-in date.'
  if (checkIn < today) return 'Check-in cannot be in the past.'
  const end = horizonCheckout(today)
  if (checkIn >= end || checkOut > end) return 'Those dates are outside the booking window.'
  return null
}

export interface BookingInput {
  checkIn: string
  checkOut: string
  guests: number
  guestName: string
  guestEmail: string
  guestPhone: string
  message: string
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function parseBookingInput(
  body: unknown,
  today: string,
): { ok: true; value: BookingInput } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Enter the booking details.' }
  const raw = body as Record<string, unknown>
  const guestName = String(raw.guestName ?? '').trim()
  const guestEmail = String(raw.guestEmail ?? '').trim()
  const guestPhone = String(raw.guestPhone ?? '').trim()
  const message = String(raw.message ?? '').trim()
  const checkIn = String(raw.checkIn ?? '')
  const checkOut = String(raw.checkOut ?? '')
  const guests = Number(raw.guests)

  if (guestName.length < 2 || guestName.length > 120) return { ok: false, error: 'Please enter your full name.' }
  if (!EMAIL.test(guestEmail) || guestEmail.length > 200) {
    return { ok: false, error: 'Please provide a valid email address.' }
  }
  if (guestPhone.length < 7 || guestPhone.length > 40) {
    return { ok: false, error: 'Please provide a direct contact phone number.' }
  }
  if (!Number.isInteger(guests) || guests < 1 || guests > MAX_GUESTS) {
    return { ok: false, error: 'Guests must be between 1 and 16.' }
  }
  if (message.length > 2000) return { ok: false, error: 'The message is too long.' }

  const dates = validateStayDates(checkIn, checkOut, today)
  if (dates) return { ok: false, error: dates }
  return { ok: true, value: { checkIn, checkOut, guests, guestName, guestEmail, guestPhone, message } }
}

export function parseManualInput(
  body: unknown,
  today: string,
): { ok: true; value: { checkIn: string; checkOut: string; note: string } } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Enter the dates to block.' }
  const raw = body as Record<string, unknown>
  const checkIn = String(raw.checkIn ?? '')
  const checkOut = String(raw.checkOut ?? '')
  const note = String(raw.note ?? '').trim()
  if (note.length > 500) return { ok: false, error: 'The note is too long.' }
  const dates = validateStayDates(checkIn, checkOut, today)
  if (dates) return { ok: false, error: dates }
  return { ok: true, value: { checkIn, checkOut, note } }
}

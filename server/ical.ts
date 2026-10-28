import { addDays, isIsoDate } from './dates.ts'

export interface CalendarEvent {
  uid: string
  checkIn: string
  checkOut: string
  summary: string
}

function unfold(text: string): string[] {
  const raw = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const lines: string[] = []
  for (const line of raw) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && lines.length > 0) {
      lines[lines.length - 1] += line.slice(1)
    } else {
      lines.push(line)
    }
  }
  return lines
}

function unescapeText(value: string) {
  return value.replace(/\\n/gi, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\')
}

function escapeText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

function dateFromIcal(value: string) {
  const match = /^(\d{4})(\d{2})(\d{2})/.exec(value.trim())
  if (!match) return null
  const iso = `${match[1]}-${match[2]}-${match[3]}`
  return isIsoDate(iso) ? iso : null
}

function eventFrom(fields: Record<string, string>): CalendarEvent | null {
  const checkIn = fields.DTSTART ? dateFromIcal(fields.DTSTART) : null
  if (!checkIn) return null
  let checkOut = fields.DTEND ? dateFromIcal(fields.DTEND) : null
  if (!checkOut || checkOut <= checkIn) checkOut = addDays(checkIn, 1)
  const summary = unescapeText(fields.SUMMARY || 'Reserved').slice(0, 300)
  const uid = fields.UID?.trim() || `no-uid:${checkIn}:${checkOut}:${summary}`
  return { uid, checkIn, checkOut, summary }
}

export function parseIcal(text: string): CalendarEvent[] {
  const events: CalendarEvent[] = []
  let current: Record<string, string> | null = null

  for (const line of unfold(text)) {
    if (line === 'BEGIN:VEVENT') {
      current = {}
      continue
    }
    if (line === 'END:VEVENT') {
      if (current) {
        const event = eventFrom(current)
        if (event) events.push(event)
      }
      current = null
      continue
    }
    if (!current) continue
    const sep = line.indexOf(':')
    if (sep === -1) continue
    const name = line.slice(0, sep).split(';')[0]?.toUpperCase()
    if (!name) continue
    if (name === 'UID' || name === 'DTSTART' || name === 'DTEND' || name === 'SUMMARY') {
      current[name] = line.slice(sep + 1).trim()
    }
  }

  return events
}

export function dedupeEvents(events: CalendarEvent[]) {
  const byUid = new Map<string, CalendarEvent>()
  for (const event of events) byUid.set(event.uid, event)
  return [...byUid.values()]
}

export function buildIcal(events: CalendarEvent[], now = new Date()) {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Casa Oceano Rio//Bookings//EN',
    'CALSCALE:GREGORIAN',
  ]

  for (const event of events) {
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${event.uid}`)
    lines.push(`DTSTAMP:${stamp}`)
    lines.push(`DTSTART;VALUE=DATE:${event.checkIn.replace(/-/g, '')}`)
    lines.push(`DTEND;VALUE=DATE:${event.checkOut.replace(/-/g, '')}`)
    lines.push(`SUMMARY:${escapeText(event.summary)}`)
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')
  return `${lines.join('\r\n')}\r\n`
}

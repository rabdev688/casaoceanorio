import nodemailer from 'nodemailer'

import { loadLocalEnv } from './env.ts'
import {
  PROPERTY_ADDRESS,
  SHELLY_PHONE,
  VRBO_LISTING,
  WILLIE_PHONE,
  formatLongDate,
} from './dates.ts'
import type { StayRecord } from './db.ts'

loadLocalEnv()

function phones() {
  return `Willie at ${WILLIE_PHONE} or Shelly at ${SHELLY_PHONE}`
}

export function hostRecipients() {
  return (process.env.MAIL_TO || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function adminLink() {
  const base = (process.env.PUBLIC_SITE_URL || '').replace(/\/$/, '')
  return base ? `${base}/admin` : '/admin'
}

export function exportUrl() {
  const token = process.env.ICS_EXPORT_TOKEN
  const base = (process.env.PUBLIC_SITE_URL || '').replace(/\/$/, '')
  if (!token || !base) return null
  return `${base}/api/calendar.ics?token=${encodeURIComponent(token)}`
}

async function sendMail(to: string | string[], subject: string, text: string) {
  const host = process.env.MAIL_HOST
  const user = process.env.MAIL_USER || process.env.MAIL_FROM
  const from = process.env.MAIL_FROM || user
  const pass = process.env.MAIL_PASSWORD
  const port = Number(process.env.MAIL_PORT || 465)
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean)
  if (!host || !user || !from || !pass || recipients.length === 0 || !Number.isFinite(port)) return false
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  })
  await transport.sendMail({ from, to: recipients, subject, text })
  return true
}

function stayLines(stay: StayRecord) {
  return [
    `Reference: ${stay.reference}`,
    `Check-in: ${formatLongDate(stay.checkIn)}`,
    `Check-out: ${formatLongDate(stay.checkOut)}`,
    `Guests: ${stay.guests ?? 'Not set'}`,
  ].join('\n')
}

export function sendGuestConfirmation(stay: StayRecord) {
  if (!stay.guestEmail) return Promise.resolve(false)
  const text = [
    'Your stay at Casa Oceano Rio is confirmed.',
    '',
    stayLines(stay),
    '',
    PROPERTY_ADDRESS,
    '',
    `To change or cancel, call or text ${phones()}.`,
  ].join('\n')
  return sendMail(stay.guestEmail, `Your Casa Oceano Rio stay is confirmed (${stay.reference})`, text)
}

export function sendGuestCancellation(stay: StayRecord) {
  if (!stay.guestEmail) return Promise.resolve(false)
  const text = [
    `Your booking reference ${stay.reference} for ${formatLongDate(stay.checkIn)} to ${formatLongDate(stay.checkOut)} has been cancelled by the property host.`,
    '',
    `For refund questions, call or text ${phones()}.`,
    '',
    'Casa Oceano Rio',
    PROPERTY_ADDRESS,
  ].join('\n')
  return sendMail(stay.guestEmail, `Your booking ${stay.reference} has been cancelled`, text)
}

export function sendHostBooking(stay: StayRecord) {
  const text = [
    `New direct booking ${stay.reference}`,
    '',
    stayLines(stay),
    `Name: ${stay.guestName || ''}`,
    `Email: ${stay.guestEmail || ''}`,
    `Phone: ${stay.guestPhone || ''}`,
    `Message: ${stay.message || 'None'}`,
    '',
    `Block listing ${VRBO_LISTING} now if VRBO has not imported the calendar yet.`,
    '',
    `Admin: ${adminLink()}`,
  ].join('\n')
  return sendMail(hostRecipients(), `New direct booking ${stay.reference}`, text)
}

export function sendHostConflict(
  stay: StayRecord,
  vrboRanges: { checkIn: string; checkOut: string }[],
) {
  const blocks = vrboRanges
    .map((range) => `VRBO block: ${formatLongDate(range.checkIn)} to ${formatLongDate(range.checkOut)}`)
    .join('\n')
  const text = [
    'A website booking overlaps a VRBO block.',
    '',
    `Website booking ${stay.reference}`,
    stayLines(stay),
    `Name: ${stay.guestName || ''}`,
    `Email: ${stay.guestEmail || ''}`,
    `Phone: ${stay.guestPhone || ''}`,
    '',
    blocks || 'VRBO block dates were not listed.',
    '',
    `Contact the guest and check listing ${VRBO_LISTING}. Neither booking was cancelled automatically.`,
    '',
    `Admin: ${adminLink()}`,
  ].join('\n')
  return sendMail(hostRecipients(), `Booking conflict ${stay.reference}`, text)
}

export function sendHostCancel(stay: StayRecord) {
  const text = [
    `You cancelled website booking ${stay.reference} (${formatLongDate(stay.checkIn)} to ${formatLongDate(stay.checkOut)}).`,
    '',
    'The nights are open on this website and will drop off the VRBO import calendar the next time VRBO reads it.',
    `Check listing ${VRBO_LISTING} if those dates are still blocked there.`,
    '',
    `Admin: ${adminLink()}`,
  ].join('\n')
  return sendMail(hostRecipients(), `Cancelled ${stay.reference}`, text)
}

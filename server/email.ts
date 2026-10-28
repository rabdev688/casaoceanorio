import nodemailer from 'nodemailer'

import { loadLocalEnv } from './env.js'
import {
  PROPERTY_ADDRESS,
  SHELLY_PHONE,
  VRBO_LISTING,
  WILLIE_PHONE,
  formatLongDate,
} from './dates.js'
import type { StayRecord } from './db.js'
import {
  alertBanner,
  buttonLink,
  detailsTable,
  escapeHtml,
  paragraph,
  phoneLinks,
  renderEmail,
  sectionTitle,
  textLink,
} from './emailTemplate.js'

loadLocalEnv()

function phones() {
  return `Willie at ${WILLIE_PHONE} or Shelly at ${SHELLY_PHONE}`
}

function phonesHtml() {
  return phoneLinks(WILLIE_PHONE, SHELLY_PHONE)
}

export function hostRecipients() {
  return (process.env.MAIL_TO || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function ccRecipients() {
  return (process.env.MAIL_CC || '')
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

async function sendMail(to: string | string[], subject: string, text: string, html: string) {
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
  const cc = ccRecipients()
  await transport.sendMail({
    from,
    to: recipients,
    ...(cc.length > 0 ? { cc } : {}),
    subject,
    text,
    html,
  })
  return true
}

function stayDetailRows(stay: StayRecord) {
  return [
    { label: 'Reference', value: stay.reference },
    { label: 'Check-in', value: formatLongDate(stay.checkIn) },
    { label: 'Check-out', value: formatLongDate(stay.checkOut) },
    { label: 'Guests', value: stay.guests == null ? 'Not set' : String(stay.guests) },
  ]
}

function stayLines(stay: StayRecord) {
  return stayDetailRows(stay)
    .map((row) => `${row.label}: ${row.value}`)
    .join('\n')
}

function guestContactRows(stay: StayRecord) {
  return [
    { label: 'Name', value: stay.guestName || '—' },
    { label: 'Email', value: stay.guestEmail || '—' },
    { label: 'Phone', value: stay.guestPhone || '—' },
    { label: 'Message', value: stay.message || 'None' },
  ]
}

export function sendGuestConfirmation(stay: StayRecord) {
  if (!stay.guestEmail) return Promise.resolve(false)
  const subject = `Your Casa Oceano Rio stay is confirmed (${stay.reference})`
  const text = [
    'Your stay at Casa Oceano Rio is confirmed.',
    '',
    stayLines(stay),
    '',
    PROPERTY_ADDRESS,
    '',
    `To change or cancel, call or text ${phones()}.`,
  ].join('\n')
  const bodyHtml = [
    paragraph('Thank you for booking with us. Your stay is confirmed.'),
    sectionTitle('Reservation'),
    detailsTable(stayDetailRows(stay)),
    paragraph(`<strong style="color:#142f36;">${escapeHtml(PROPERTY_ADDRESS)}</strong>`),
    paragraph(`To change or cancel your reservation, call or text ${phonesHtml()}.`),
  ].join('')
  const html = renderEmail({
    title: subject,
    preheader: `Confirmed: ${formatLongDate(stay.checkIn)} – ${formatLongDate(stay.checkOut)}`,
    headline: 'Your stay is confirmed',
    bodyHtml,
  })
  return sendMail(stay.guestEmail, subject, text, html)
}

export function sendGuestCancellation(stay: StayRecord) {
  if (!stay.guestEmail) return Promise.resolve(false)
  const subject = `Your booking ${stay.reference} has been cancelled`
  const range = `${formatLongDate(stay.checkIn)} to ${formatLongDate(stay.checkOut)}`
  const text = [
    `Your booking reference ${stay.reference} for ${range} has been cancelled by the property host.`,
    '',
    `For refund questions, call or text ${phones()}.`,
    '',
    'Casa Oceano Rio',
    PROPERTY_ADDRESS,
  ].join('\n')
  const bodyHtml = [
    paragraph(
      `Your booking <strong>${escapeHtml(stay.reference)}</strong> for ${escapeHtml(range)} has been cancelled by the property host.`,
    ),
    paragraph(`For refund questions, call or text ${phonesHtml()}.`),
  ].join('')
  const html = renderEmail({
    title: subject,
    preheader: `Booking ${stay.reference} was cancelled`,
    headline: 'Booking cancelled',
    bodyHtml,
  })
  return sendMail(stay.guestEmail, subject, text, html)
}

export function sendHostBooking(stay: StayRecord) {
  const subject = `New direct booking ${stay.reference}`
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
  const admin = adminLink()
  const guestEmail = stay.guestEmail?.trim()
  const bodyHtml = [
    paragraph(`A new direct booking was submitted on the website.`),
    sectionTitle('Stay details'),
    detailsTable(stayDetailRows(stay)),
    sectionTitle('Guest'),
    detailsTable(guestContactRows(stay)),
    paragraph(
      `Block listing ${escapeHtml(VRBO_LISTING)} on VRBO now if the calendar has not imported yet.`,
    ),
    guestEmail
      ? paragraph(`Reply to the guest: ${textLink(`mailto:${guestEmail}`, guestEmail)}`)
      : '',
    buttonLink(admin, 'Open admin'),
  ].join('')
  const html = renderEmail({
    title: subject,
    preheader: `${stay.guestName || 'Guest'} · ${formatLongDate(stay.checkIn)}`,
    headline: `New booking ${stay.reference}`,
    bodyHtml,
  })
  return sendMail(hostRecipients(), subject, text, html)
}

export function sendHostConflict(
  stay: StayRecord,
  vrboRanges: { checkIn: string; checkOut: string }[],
) {
  const blocks = vrboRanges
    .map((range) => `VRBO block: ${formatLongDate(range.checkIn)} to ${formatLongDate(range.checkOut)}`)
    .join('\n')
  const subject = `Booking conflict ${stay.reference}`
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
  const blockRows =
    vrboRanges.length > 0
      ? vrboRanges.map((range) => ({
          label: 'VRBO block',
          value: `${formatLongDate(range.checkIn)} – ${formatLongDate(range.checkOut)}`,
        }))
      : [{ label: 'VRBO block', value: 'Dates were not listed' }]
  const admin = adminLink()
  const bodyHtml = [
    alertBanner('This website booking overlaps a VRBO calendar block. Review both calendars.'),
    sectionTitle('Website booking'),
    detailsTable(stayDetailRows(stay)),
    detailsTable(guestContactRows(stay).filter((row) => row.label !== 'Message')),
    sectionTitle('Overlapping blocks'),
    detailsTable(blockRows),
    paragraph(
      `Contact the guest and check listing ${escapeHtml(VRBO_LISTING)}. Neither booking was cancelled automatically.`,
    ),
    buttonLink(admin, 'Open admin'),
  ].join('')
  const html = renderEmail({
    title: subject,
    preheader: `Conflict on ${formatLongDate(stay.checkIn)}`,
    headline: `Conflict ${stay.reference}`,
    bodyHtml,
  })
  return sendMail(hostRecipients(), subject, text, html)
}

export function sendHostCancel(stay: StayRecord) {
  const subject = `Cancelled ${stay.reference}`
  const range = `${formatLongDate(stay.checkIn)} to ${formatLongDate(stay.checkOut)}`
  const text = [
    `You cancelled website booking ${stay.reference} (${range}).`,
    '',
    'The nights are open on this website and will drop off the VRBO import calendar the next time VRBO reads it.',
    `Check listing ${VRBO_LISTING} if those dates are still blocked there.`,
    '',
    `Admin: ${adminLink()}`,
  ].join('\n')
  const admin = adminLink()
  const bodyHtml = [
    paragraph(`Website booking <strong>${escapeHtml(stay.reference)}</strong> (${escapeHtml(range)}) was cancelled.`),
    paragraph(
      'Those nights are open on this website and will drop off the VRBO import calendar the next time VRBO reads it.',
    ),
    paragraph(`Check listing ${escapeHtml(VRBO_LISTING)} if those dates are still blocked on VRBO.`),
    buttonLink(admin, 'Open admin'),
  ].join('')
  const html = renderEmail({
    title: subject,
    preheader: `Cancelled ${range}`,
    headline: 'Booking cancelled',
    bodyHtml,
  })
  return sendMail(hostRecipients(), subject, text, html)
}

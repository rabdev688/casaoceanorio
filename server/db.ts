import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

import { loadLocalEnv } from './env.js'

loadLocalEnv()

export type Sql = NeonQueryFunction<false, false>

let client: Sql | null = null
let clientUrl = ''

export function getSql(): Sql | null {
  const url = process.env.DATABASE_URL
  if (!url) return null
  if (!client || clientUrl !== url) {
    client = neon(url)
    clientUrl = url
  }
  return client
}

export type EmailStatus = 'pending' | 'sent' | 'failed'
export type StaySource = 'website' | 'manual'

export interface StayRecord {
  id: string
  reference: string
  source: StaySource
  status: 'confirmed' | 'cancelled'
  checkIn: string
  checkOut: string
  guestName: string | null
  guestEmail: string | null
  guestPhone: string | null
  guests: number | null
  message: string | null
  conflict: boolean
  guestEmailStatus: EmailStatus
  hostEmailStatus: EmailStatus
  createdAt: string
  cancelledAt: string | null
}

export interface BlockRecord {
  id: string
  eventUid: string
  checkIn: string
  checkOut: string
  summary: string | null
}

export interface SyncRecord {
  lastSuccessAt: string | null
  lastError: string | null
  lastErrorAt: string | null
}

export function asDate(value: unknown) {
  if (value instanceof Date) {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  return String(value).slice(0, 10)
}

function asText(value: unknown) {
  if (value == null) return null
  return String(value)
}

function asStatus(value: unknown): EmailStatus {
  if (value === 'sent' || value === 'failed' || value === 'pending') return value
  return 'pending'
}

export function mapStay(row: Record<string, unknown>): StayRecord {
  return {
    id: String(row.id),
    reference: String(row.reference),
    source: row.source === 'manual' ? 'manual' : 'website',
    status: row.status === 'cancelled' ? 'cancelled' : 'confirmed',
    checkIn: asDate(row.check_in),
    checkOut: asDate(row.check_out),
    guestName: asText(row.guest_name),
    guestEmail: asText(row.guest_email),
    guestPhone: asText(row.guest_phone),
    guests: row.guests == null ? null : Number(row.guests),
    message: asText(row.message),
    conflict: Boolean(row.conflict),
    guestEmailStatus: asStatus(row.guest_email_status),
    hostEmailStatus: asStatus(row.host_email_status),
    createdAt: String(row.created_at),
    cancelledAt: row.cancelled_at == null ? null : String(row.cancelled_at),
  }
}

export function mapBlock(row: Record<string, unknown>): BlockRecord {
  return {
    id: String(row.id),
    eventUid: String(row.event_uid),
    checkIn: asDate(row.check_in),
    checkOut: asDate(row.check_out),
    summary: asText(row.summary),
  }
}

export function mapSync(row: Record<string, unknown> | undefined): SyncRecord {
  return {
    lastSuccessAt: row?.last_success_at == null ? null : String(row.last_success_at),
    lastError: row?.last_error == null ? null : String(row.last_error),
    lastErrorAt: row?.last_error_at == null ? null : String(row.last_error_at),
  }
}

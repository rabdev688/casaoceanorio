import { parseBookingInput, parseManualInput, todayInTimeZone } from './dates.ts'
import {
  getSql,
  mapStay,
  type EmailStatus,
  type StayRecord,
} from './db.ts'
import {
  sendGuestCancellation,
  sendGuestConfirmation,
  sendHostBooking,
  sendHostCancel,
} from './email.ts'
import { errorCode, json, readJson } from './http.ts'
import { syncVrbo } from './sync.ts'

const TAKEN = 'Those nights are no longer open.'

interface InsertInput {
  prefix: 'CO-' | 'MB-'
  source: 'website' | 'manual'
  checkIn: string
  checkOut: string
  guestName: string | null
  guestEmail: string | null
  guestPhone: string | null
  guests: number | null
  message: string | null
  guestEmailStatus: EmailStatus
  hostEmailStatus: EmailStatus
  today: string
}

async function insertStay(input: InsertInput): Promise<StayRecord | 'conflict'> {
  const sql = getSql()
  if (!sql) throw new Error('Database is not configured.')
  try {
    const rows = (await sql`
      WITH overlap AS (
        SELECT 1
        FROM stays
        WHERE status = 'confirmed'
          AND daterange(check_in, check_out, '[)') && daterange(${input.checkIn}::date, ${input.checkOut}::date, '[)')
        UNION ALL
        SELECT 1
        FROM vrbo_blocks
        WHERE daterange(check_in, check_out, '[)') && daterange(${input.checkIn}::date, ${input.checkOut}::date, '[)')
        LIMIT 1
      ),
      bumped AS (
        INSERT INTO booking_counters (day, last_value)
        SELECT ${input.today}::date, 1
        WHERE NOT EXISTS (SELECT 1 FROM overlap)
        ON CONFLICT (day) DO UPDATE
          SET last_value = booking_counters.last_value + 1
        RETURNING last_value
      ),
      inserted AS (
        INSERT INTO stays (
          reference, source, status, check_in, check_out,
          guest_name, guest_email, guest_phone, guests, message,
          guest_email_status, host_email_status
        )
        SELECT
          ${input.prefix} || to_char(${input.today}::date, 'YYYYMMDD') || '-' || lpad(bumped.last_value::text, 3, '0'),
          ${input.source},
          'confirmed',
          ${input.checkIn}::date,
          ${input.checkOut}::date,
          ${input.guestName},
          ${input.guestEmail},
          ${input.guestPhone},
          ${input.guests},
          ${input.message},
          ${input.guestEmailStatus},
          ${input.hostEmailStatus}
        FROM bumped
        RETURNING *
      )
      SELECT * FROM inserted
    `) as Record<string, unknown>[]
    if (rows.length === 0) return 'conflict'
    return mapStay(rows[0] as Record<string, unknown>)
  } catch (error) {
    if (errorCode(error) === '23P01') return 'conflict'
    throw error
  }
}

async function setEmailStatus(id: string, guest: EmailStatus, host: EmailStatus) {
  const sql = getSql()
  if (!sql) return
  await sql`
    UPDATE stays
    SET guest_email_status = ${guest}, host_email_status = ${host}
    WHERE id = ${id}::uuid
  `
}

async function mark(ok: boolean): Promise<EmailStatus> {
  return ok ? 'sent' : 'failed'
}

export async function createWebsiteBooking(request: Request) {
  if (!getSql()) return json({ error: 'Database is not configured.' }, 503)
  const today = todayInTimeZone()
  const parsed = parseBookingInput(await readJson(request), today)
  if (!parsed.ok) return json({ error: parsed.error }, 400)

  await syncVrbo()
  const { value } = parsed
  let stay: StayRecord | 'conflict'
  try {
    stay = await insertStay({
      prefix: 'CO-',
      source: 'website',
      checkIn: value.checkIn,
      checkOut: value.checkOut,
      guestName: value.guestName,
      guestEmail: value.guestEmail,
      guestPhone: value.guestPhone,
      guests: value.guests,
      message: value.message || null,
      guestEmailStatus: 'pending',
      hostEmailStatus: 'pending',
      today,
    })
  } catch {
    return json({ error: 'The stay could not be saved. Call or text Willie or Shelly.' }, 500)
  }
  if (stay === 'conflict') return json({ error: TAKEN }, 409)

  const guest = await mark(await sendGuestConfirmation(stay).catch(() => false))
  const host = await mark(await sendHostBooking(stay).catch(() => false))
  await setEmailStatus(stay.id, guest, host)

  return json(
    { reference: stay.reference, checkIn: stay.checkIn, checkOut: stay.checkOut, guests: stay.guests },
    201,
  )
}

export async function createManualBlock(request: Request) {
  if (!getSql()) return json({ error: 'Database is not configured.' }, 503)
  const today = todayInTimeZone()
  const parsed = parseManualInput(await readJson(request), today)
  if (!parsed.ok) return json({ error: parsed.error }, 400)
  try {
    const stay = await insertStay({
      prefix: 'MB-',
      source: 'manual',
      checkIn: parsed.value.checkIn,
      checkOut: parsed.value.checkOut,
      guestName: null,
      guestEmail: null,
      guestPhone: null,
      guests: null,
      message: parsed.value.note || null,
      guestEmailStatus: 'sent',
      hostEmailStatus: 'sent',
      today,
    })
    if (stay === 'conflict') return json({ error: TAKEN }, 409)
    return json({ stay }, 201)
  } catch {
    return json({ error: 'The block could not be saved.' }, 500)
  }
}

export async function deleteManualBlock(request: Request) {
  const sql = getSql()
  if (!sql) return json({ error: 'Database is not configured.' }, 503)
  const id = new URL(request.url).searchParams.get('id') || ''
  if (!id) return json({ error: 'Choose a manual block to remove.' }, 400)
  const rows = (await sql`
    DELETE FROM stays
    WHERE id = ${id}::uuid AND source = 'manual'
    RETURNING id
  `) as Record<string, unknown>[]
  if (rows.length === 0) return json({ error: 'That manual block was not found.' }, 404)
  return json({ ok: true })
}

async function loadWebsiteStay(id: string) {
  const sql = getSql()
  if (!sql) return null
  const rows = (await sql`
    SELECT *
    FROM stays
    WHERE id = ${id}::uuid AND source = 'website'
  `) as Record<string, unknown>[]
  return rows[0] ? mapStay(rows[0]) : null
}

export async function cancelWebsiteStay(request: Request) {
  const sql = getSql()
  if (!sql) return json({ error: 'Database is not configured.' }, 503)
  const body = (await readJson(request)) as { id?: string } | null
  const id = String(body?.id || '')
  if (!id) return json({ error: 'Choose a booking to cancel.' }, 400)
  const rows = (await sql`
    UPDATE stays
    SET status = 'cancelled', cancelled_at = now(), guest_email_status = 'pending'
    WHERE id = ${id}::uuid AND source = 'website' AND status = 'confirmed'
    RETURNING *
  `) as Record<string, unknown>[]
  if (rows.length === 0) return json({ error: 'That confirmed website booking was not found.' }, 404)
  const stay = mapStay(rows[0] as Record<string, unknown>)
  const guest = await mark(await sendGuestCancellation(stay).catch(() => false))
  const host = await mark(await sendHostCancel(stay).catch(() => false))
  await setEmailStatus(stay.id, guest, host)
  return json({ ok: true, stay: { ...stay, guestEmailStatus: guest, hostEmailStatus: host } })
}

export async function resendGuestEmail(request: Request) {
  if (!getSql()) return json({ error: 'Database is not configured.' }, 503)
  const body = (await readJson(request)) as { id?: string } | null
  const stay = await loadWebsiteStay(String(body?.id || ''))
  if (!stay) return json({ error: 'That website booking was not found.' }, 404)
  const sent =
    stay.status === 'cancelled'
      ? await sendGuestCancellation(stay).catch(() => false)
      : await sendGuestConfirmation(stay).catch(() => false)
  const guest = await mark(sent)
  await setEmailStatus(stay.id, guest, stay.hostEmailStatus)
  return json({ ok: sent, guestEmailStatus: guest })
}

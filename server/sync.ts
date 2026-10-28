import { SYNC_MAX_AGE_MS } from './dates.js'
import { asDate, getSql, mapStay, mapSync, type StayRecord, type SyncRecord } from './db.js'
import { sendHostConflict } from './email.js'
import { errorText } from './http.js'
import { dedupeEvents, parseIcal, type CalendarEvent } from './ical.js'

export interface SyncStatus {
  state: 'not_configured' | 'never_synced' | 'ok' | 'error'
  lastSync: string | null
  lastError: string | null
}

export function describeSync(row: SyncRecord, configured: boolean): SyncStatus {
  if (!configured) return { state: 'not_configured', lastSync: null, lastError: null }
  if (!row.lastSuccessAt) return { state: 'never_synced', lastSync: null, lastError: row.lastError }
  if (row.lastErrorAt && Date.parse(row.lastErrorAt) > Date.parse(row.lastSuccessAt)) {
    return { state: 'error', lastSync: row.lastSuccessAt, lastError: row.lastError }
  }
  return { state: 'ok', lastSync: row.lastSuccessAt, lastError: null }
}

export function syncBanner(status: SyncStatus) {
  if (status.state === 'not_configured') return 'VRBO calendar not configured'
  if (status.state === 'never_synced') return 'VRBO calendar has not synced yet'
  return null
}

export async function readSyncRow(): Promise<SyncRecord> {
  const sql = getSql()
  if (!sql) return { lastSuccessAt: null, lastError: null, lastErrorAt: null }
  const rows = (await sql`SELECT last_success_at, last_error, last_error_at FROM sync_state WHERE id = 1`) as Record<
    string,
    unknown
  >[]
  return mapSync(rows[0])
}

async function recordSyncError(message: string) {
  const sql = getSql()
  if (!sql) return
  const text = message.slice(0, 500)
  await sql`
    UPDATE sync_state
    SET last_error = ${text}, last_error_at = now()
    WHERE id = 1
  `
}

async function replaceFeed(events: CalendarEvent[]): Promise<StayRecord[]> {
  const sql = getSql()
  if (!sql) throw new Error('Database is not configured.')
  const uids = events.map((event) => event.uid)
  const checkIns = events.map((event) => event.checkIn)
  const checkOuts = events.map((event) => event.checkOut)
  const summaries = events.map((event) => event.summary)
  const rows = (await sql`
    WITH locked AS (
      SELECT pg_advisory_xact_lock(294715) AS locked
    ),
    incoming AS (
      SELECT *
      FROM unnest(
        ${uids}::text[],
        ${checkIns}::date[],
        ${checkOuts}::date[],
        ${summaries}::text[]
      ) AS t(event_uid, check_in, check_out, summary)
    ),
    removed AS (
      DELETE FROM vrbo_blocks
      WHERE EXISTS (SELECT 1 FROM locked)
        AND event_uid NOT IN (SELECT event_uid FROM incoming)
      RETURNING event_uid
    ),
    upserted AS (
      INSERT INTO vrbo_blocks (event_uid, check_in, check_out, summary, synced_at)
      SELECT event_uid, check_in, check_out, summary, now()
      FROM incoming
      ON CONFLICT (event_uid) DO UPDATE
        SET check_in = EXCLUDED.check_in,
            check_out = EXCLUDED.check_out,
            summary = EXCLUDED.summary,
            synced_at = now()
      RETURNING event_uid
    ),
    before_flags AS (
      SELECT id, conflict AS was_conflict
      FROM stays
      WHERE source = 'website' AND status = 'confirmed'
    ),
    recomputed AS (
      UPDATE stays AS s
      SET conflict = EXISTS (
        SELECT 1
        FROM incoming AS v
        WHERE daterange(s.check_in, s.check_out, '[)') && daterange(v.check_in, v.check_out, '[)')
      )
      WHERE s.source = 'website' AND s.status = 'confirmed'
      RETURNING s.id, s.reference, s.source, s.status, s.check_in, s.check_out, s.guest_name, s.guest_email,
        s.guest_phone, s.guests, s.message, s.conflict, s.guest_email_status, s.host_email_status, s.created_at,
        s.cancelled_at
    ),
    state AS (
      UPDATE sync_state
      SET last_success_at = now(), last_error = NULL, last_error_at = NULL
      WHERE id = 1
        AND (SELECT count(*) FROM upserted) >= 0
        AND (SELECT count(*) FROM removed) >= 0
      RETURNING last_success_at
    )
    SELECT r.*, b.was_conflict
    FROM recomputed AS r
    JOIN before_flags AS b ON b.id = r.id
    WHERE r.conflict = true
      AND b.was_conflict = false
  `) as Record<string, unknown>[]
  return rows.map((row) => mapStay(row))
}

async function overlappingVrbo(checkIn: string, checkOut: string) {
  const sql = getSql()
  if (!sql) return []
  const rows = (await sql`
    SELECT check_in, check_out
    FROM vrbo_blocks
    WHERE daterange(check_in, check_out, '[)') && daterange(${checkIn}::date, ${checkOut}::date, '[)')
    ORDER BY check_in
  `) as Record<string, unknown>[]
  return rows.map((row) => ({
    checkIn: asDate(row.check_in),
    checkOut: asDate(row.check_out),
  }))
}

let inflight: Promise<{ ok: true; flagged: number } | { ok: false; error: string }> | null = null

async function runSync(): Promise<{ ok: true; flagged: number } | { ok: false; error: string }> {
  const url = process.env.VRBO_ICAL_URL
  if (!url) return { ok: false, error: 'VRBO calendar not configured' }
  if (!getSql()) return { ok: false, error: 'Database is not configured.' }

  let text = ''
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { 'user-agent': 'CasaOceanoRio/1.0' },
    })
    if (!response.ok) throw new Error(`VRBO feed returned ${response.status}`)
    text = await response.text()
  } catch (error) {
    const message = errorText(error)
    await recordSyncError(message)
    return { ok: false, error: message }
  }

  if (!text.includes('BEGIN:VCALENDAR')) {
    const message = 'VRBO feed was not a calendar.'
    await recordSyncError(message)
    return { ok: false, error: message }
  }

  const events = dedupeEvents(parseIcal(text))
  let flagged: StayRecord[] = []
  try {
    flagged = await replaceFeed(events)
  } catch (error) {
    const message = errorText(error)
    await recordSyncError(message)
    return { ok: false, error: message }
  }

  for (const stay of flagged) {
    try {
      const ranges = await overlappingVrbo(stay.checkIn, stay.checkOut)
      await sendHostConflict(stay, ranges)
    } catch (error) {
      console.error('Conflict email failed', errorText(error))
    }
  }
  return { ok: true, flagged: flagged.length }
}

export function syncVrbo() {
  if (!inflight) {
    inflight = runSync().finally(() => {
      inflight = null
    })
  }
  return inflight
}

export async function ensureFreshSync() {
  if (!process.env.VRBO_ICAL_URL || !getSql()) return
  const row = await readSyncRow()
  const last = row.lastSuccessAt ? Date.parse(row.lastSuccessAt) : 0
  if (last && Date.now() - last < SYNC_MAX_AGE_MS) return
  await syncVrbo()
}

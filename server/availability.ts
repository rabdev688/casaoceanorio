import { horizonCheckout, todayInTimeZone } from './dates.js'
import { asDate, getSql, mapBlock, mapStay } from './db.js'
import { exportUrl } from './email.js'
import { buildIcal } from './ical.js'
import { json } from './http.js'
import { describeSync, ensureFreshSync, readSyncRow, syncBanner, syncVrbo } from './sync.js'
import { secretsMatch } from './auth.js'

export async function getAvailability(request: Request) {
  const today = todayInTimeZone()
  const horizonEnd = horizonCheckout(today)
  const refresh = new URL(request.url).searchParams.get('refresh') === '1'
  if (!getSql()) {
    return json({
      today,
      horizonEnd,
      blocked: [],
      syncStatus: {
        state: 'not_configured',
        lastSync: null,
        lastError: 'Database is not configured.',
      },
      bookingEnabled: false,
    })
  }

  try {
    if (refresh) await syncVrbo()
    else await ensureFreshSync()
    const sql = getSql()
    if (!sql) throw new Error('Database is not configured.')
    const rows = (await sql`
      SELECT check_in, check_out, source::text AS source
      FROM stays
      WHERE status = 'confirmed'
      UNION ALL
      SELECT check_in, check_out, 'vrbo' AS source
      FROM vrbo_blocks
      ORDER BY 1
    `) as Record<string, unknown>[]
    const syncStatus = describeSync(await readSyncRow(), Boolean(process.env.VRBO_ICAL_URL))
    return json({
      today,
      horizonEnd,
      blocked: rows.map((row) => ({
        checkIn: asDate(row.check_in),
        checkOut: asDate(row.check_out),
        source: row.source === 'manual' || row.source === 'vrbo' ? row.source : 'website',
      })),
      syncStatus,
      bookingEnabled: true,
    })
  } catch {
    return json({ error: 'The calendar could not be loaded.' }, 500)
  }
}

export async function getCalendar(request: Request) {
  const token = process.env.ICS_EXPORT_TOKEN
  if (!token) return json({ error: 'Calendar export is not configured.' }, 503)
  const provided = new URL(request.url).searchParams.get('token') || ''
  if (!secretsMatch(provided, token)) return json({ error: 'Unauthorized.' }, 401)
  const sql = getSql()
  if (!sql) return json({ error: 'Database is not configured.' }, 503)
  const rows = (await sql`
    SELECT id, reference, source, check_in, check_out
    FROM stays
    WHERE status = 'confirmed'
    ORDER BY check_in
  `) as Record<string, unknown>[]
  const body = buildIcal(
    rows.map((row) => {
      const reference = String(row.reference)
      const source = String(row.source)
      return {
        uid: `stay-${String(row.id)}@casaoceanorio`,
        checkIn: asDate(row.check_in),
        checkOut: asDate(row.check_out),
        summary: source === 'manual' ? `Blocked ${reference}` : `Reserved ${reference}`,
      }
    }),
  )
  return new Response(body, {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

export async function getAdminStays() {
  const sql = getSql()
  if (!sql) return json({ error: 'Database is not configured.' }, 503)
  const stayRows = (await sql`SELECT * FROM stays ORDER BY check_in DESC`) as Record<string, unknown>[]
  const blockRows = (await sql`
    SELECT id, event_uid, check_in, check_out, summary
    FROM vrbo_blocks
    ORDER BY check_in
  `) as Record<string, unknown>[]
  const syncStatus = describeSync(await readSyncRow(), Boolean(process.env.VRBO_ICAL_URL))
  return json({
    stays: stayRows.map((row) => mapStay(row)),
    vrboBlocks: blockRows.map((row) => mapBlock(row)),
    syncStatus,
    banner: syncBanner(syncStatus),
    exportUrl: exportUrl(),
  })
}

export async function postAdminSync() {
  if (!getSql()) return json({ error: 'Database is not configured.' }, 503)
  if (!process.env.VRBO_ICAL_URL) {
    const syncStatus = describeSync(await readSyncRow(), false)
    return json({ ok: false, error: 'VRBO calendar not configured', syncStatus, banner: syncBanner(syncStatus) })
  }
  const result = await syncVrbo()
  const syncStatus = describeSync(await readSyncRow(), true)
  if (!result.ok) {
    return json({ ok: false, error: result.error, syncStatus, banner: syncBanner(syncStatus) })
  }
  return json({ ok: true, flagged: result.flagged, syncStatus, banner: syncBanner(syncStatus) })
}

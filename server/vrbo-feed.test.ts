import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { loadLocalEnv } from './env.ts'
import { parseIcal } from './ical.ts'

loadLocalEnv()

describe('vrbo feed', () => {
  it('downloads the configured calendar and reads its events', async () => {
    const url = process.env.VRBO_ICAL_URL
    assert.ok(url, 'VRBO_ICAL_URL is not set')
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: { 'user-agent': 'CasaOceanoRio/1.0' },
    })
    assert.equal(response.ok, true, `VRBO feed returned ${response.status}`)
    const text = await response.text()
    assert.equal(text.includes('BEGIN:VCALENDAR'), true)
    const events = parseIcal(text)
    assert.ok(events.length > 0, 'VRBO feed had no events')
    for (const event of events) {
      assert.ok(event.uid)
      assert.ok(event.checkOut > event.checkIn)
    }
  })
})

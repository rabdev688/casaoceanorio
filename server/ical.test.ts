import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildIcal, parseIcal } from './ical.ts'

const sample = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:vrbo-1
DTSTART;VALUE=DATE:20261110
DTEND;VALUE=DATE:20261113
SUMMARY:Hello 
 world
END:VEVENT
BEGIN:VEVENT
DTSTART:20270105T150000Z
DTEND:20270108T110000Z
SUMMARY:No uid
END:VEVENT
END:VCALENDAR`

describe('ical', () => {
  it('parses all-day dates, folded lines, and a missing uid', () => {
    const events = parseIcal(sample)
    assert.equal(events.length, 2)
    assert.deepEqual(events[0], {
      uid: 'vrbo-1',
      checkIn: '2026-11-10',
      checkOut: '2026-11-13',
      summary: 'Hello world',
    })
    assert.equal(events[1]?.checkIn, '2027-01-05')
    assert.equal(events[1]?.checkOut, '2027-01-08')
    assert.equal(events[1]?.uid, 'no-uid:2027-01-05:2027-01-08:No uid')
  })

  it('round-trips an export and keeps checkout exclusive', () => {
    const ics = buildIcal(
      [
        {
          uid: 'stay-1@casaoceanorio',
          checkIn: '2026-12-01',
          checkOut: '2026-12-04',
          summary: 'Reserved CO-20261027-001',
        },
      ],
      new Date('2026-10-27T15:00:00Z'),
    )
    const [event] = parseIcal(ics)
    assert.equal(event?.checkIn, '2026-12-01')
    assert.equal(event?.checkOut, '2026-12-04')
    assert.equal(event?.summary, 'Reserved CO-20261027-001')
    assert.equal(ics.includes('BEGIN:VCALENDAR'), true)
  })
})

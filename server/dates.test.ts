import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { asDate } from './db.ts'
import { eachNight, horizonCheckout, nightCount, rangesOverlap, validateStayDates } from './dates.ts'

describe('night overlap', () => {
  it('treats checkout morning as free', () => {
    assert.equal(rangesOverlap('2026-11-10', '2026-11-13', '2026-11-13', '2026-11-15'), false)
    assert.deepEqual(eachNight('2026-11-10', '2026-11-13'), ['2026-11-10', '2026-11-11', '2026-11-12'])
    assert.equal(nightCount('2026-11-10', '2026-11-13'), 3)
  })

  it('rejects a range that shares a night', () => {
    assert.equal(rangesOverlap('2026-11-10', '2026-11-13', '2026-11-12', '2026-11-14'), true)
  })

  it('keeps a local calendar day when the database returns a Date', () => {
    assert.equal(asDate(new Date(2026, 10, 11)), '2026-11-11')
    assert.equal(asDate('2026-11-11'), '2026-11-11')
  })

  it('keeps the booking window at 18 months of nights', () => {
    assert.equal(horizonCheckout('2026-10-27'), '2028-04-01')
    assert.equal(validateStayDates('2026-10-27', '2028-04-01', '2026-10-27'), null)
    assert.equal(
      validateStayDates('2028-04-01', '2028-04-02', '2026-10-27'),
      'Those dates are outside the booking window.',
    )
    assert.equal(validateStayDates('2026-10-26', '2026-10-28', '2026-10-27'), 'Check-in cannot be in the past.')
  })
})

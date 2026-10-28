import { useCallback, useEffect, useState } from 'react'
import { SYNC_MAX_AGE_MS } from '../../server/dates.js'

export interface BlockedRange {
  checkIn: string
  checkOut: string
  source: 'website' | 'manual' | 'vrbo'
}

export interface AvailabilityPayload {
  today: string
  horizonEnd: string
  blocked: BlockedRange[]
  syncStatus: {
    state: 'not_configured' | 'never_synced' | 'ok' | 'error'
    lastSync: string | null
    lastError: string | null
  }
  bookingEnabled: boolean
}

let cached: AvailabilityPayload | null = null
let cachedAt = 0
let pending: Promise<AvailabilityPayload> | null = null
const listeners = new Set<(data: AvailabilityPayload) => void>()

function publish(data: AvailabilityPayload) {
  cached = data
  cachedAt = Date.now()
  listeners.forEach((listener) => listener(data))
}

export function loadAvailability(force = false) {
  if (!force && cached && Date.now() - cachedAt < SYNC_MAX_AGE_MS) return Promise.resolve(cached)
  if (!force && pending) return pending
  const url = force ? '/api/availability?refresh=1' : '/api/availability'
  const request = fetch(url, { cache: 'no-store' }).then(async (response) => {
    const body = (await response.json()) as AvailabilityPayload & { error?: string }
    if (!response.ok) throw new Error(body.error || 'The calendar could not be loaded.')
    publish(body)
    return body
  })
  if (!force) {
    pending = request.finally(() => {
      pending = null
    })
    return pending
  }
  return request
}

export function useAvailability() {
  const [data, setData] = useState<AvailabilityPayload | null>(cached)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(!cached)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const next = await loadAvailability(true)
      setData(next)
      setError(null)
      return next
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The calendar could not be loaded.')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const listener = (next: AvailabilityPayload) => {
      setData(next)
      setError(null)
    }
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  useEffect(() => {
    let active = true
    loadAvailability(false)
      .then((next) => {
        if (!active) return
        setData(next)
        setError(null)
      })
      .catch((err: unknown) => {
        if (!active) return
        setError(err instanceof Error ? err.message : 'The calendar could not be loaded.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return { data, error, loading, reload }
}

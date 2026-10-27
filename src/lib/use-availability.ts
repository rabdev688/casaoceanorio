import { useCallback, useEffect, useState } from 'react'

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
let pending: Promise<AvailabilityPayload> | null = null

export function loadAvailability(force = false) {
  if (!force && cached) return Promise.resolve(cached)
  if (!force && pending) return pending
  pending = fetch('/api/availability', { cache: 'no-store' })
    .then(async (response) => {
      const body = (await response.json()) as AvailabilityPayload & { error?: string }
      if (!response.ok) throw new Error(body.error || 'The calendar could not be loaded.')
      cached = body
      return body
    })
    .finally(() => {
      pending = null
    })
  return pending
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The calendar could not be loaded.')
    } finally {
      setLoading(false)
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

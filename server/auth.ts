import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

import { json, readJson } from './http.ts'

const COOKIE = 'casa_admin'
const WEEK = 7 * 24 * 60 * 60

export function secretsMatch(input: string, expected: string) {
  const left = createHash('sha256').update(input).digest()
  const right = createHash('sha256').update(expected).digest()
  return timingSafeEqual(left, right)
}

function sign(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function cookieFlags() {
  const secure = process.env.VERCEL_ENV === 'production' ? '; Secure' : ''
  return `HttpOnly; Path=/; SameSite=Lax${secure}`
}

export async function login(request: Request) {
  if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
    return json({ error: 'Admin login is not configured.' }, 503)
  }
  const body = (await readJson(request)) as { password?: string } | null
  const password = String(body?.password ?? '')
  if (!secretsMatch(password, process.env.ADMIN_PASSWORD)) {
    return json({ error: 'That password is not right.' }, 401)
  }
  const exp = Math.floor(Date.now() / 1000) + WEEK
  const payload = `v1.${exp}`
  const token = `${payload}.${sign(payload, process.env.SESSION_SECRET)}`
  return json({ ok: true }, 200, {
    'set-cookie': `${COOKIE}=${token}; ${cookieFlags()}; Max-Age=${WEEK}`,
  })
}

export function logout() {
  return json({ ok: true }, 200, {
    'set-cookie': `${COOKIE}=; ${cookieFlags()}; Max-Age=0`,
  })
}

function readCookie(header: string, name: string) {
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return rest.join('=')
  }
  return ''
}

export async function requireAdmin(request: Request) {
  if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
    return json({ error: 'Admin login is not configured.' }, 503)
  }
  const token = readCookie(request.headers.get('cookie') || '', COOKIE)
  const parts = token.split('.')
  if (parts.length !== 3 || parts[0] !== 'v1' || !process.env.SESSION_SECRET) {
    return json({ error: 'Sign in required.' }, 401)
  }
  const payload = `v1.${parts[1]}`
  const expected = sign(payload, process.env.SESSION_SECRET)
  if (!secretsMatch(parts[2] || '', expected)) return json({ error: 'Sign in required.' }, 401)
  const exp = Number(parts[1])
  const now = Math.floor(Date.now() / 1000)
  if (!Number.isFinite(exp) || exp <= now || exp > now + WEEK + 60) {
    return json({ error: 'Sign in required.' }, 401)
  }
  return null
}

import { requireAdmin } from '../../server/auth.js'
import { postAdminSync } from '../../server/availability.js'

export async function POST(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  return postAdminSync()
}

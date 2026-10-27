import { requireAdmin } from '../../server/auth.ts'
import { postAdminSync } from '../../server/availability.ts'

export async function POST(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  return postAdminSync()
}

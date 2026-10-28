import { requireAdmin } from '../../server/auth.js'
import { getAdminStays } from '../../server/availability.js'

export async function GET(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  return getAdminStays()
}

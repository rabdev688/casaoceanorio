import { requireAdmin } from '../../server/auth.ts'
import { getAdminStays } from '../../server/availability.ts'

export async function GET(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  return getAdminStays()
}

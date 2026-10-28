import { requireAdmin } from '../../server/auth.ts'
import { cancelWebsiteStay } from '../../server/booking.ts'

export async function POST(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  return cancelWebsiteStay(request)
}

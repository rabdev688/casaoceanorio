import { requireAdmin } from '../../server/auth.js'
import { cancelWebsiteStay } from '../../server/booking.js'

export async function POST(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  return cancelWebsiteStay(request)
}

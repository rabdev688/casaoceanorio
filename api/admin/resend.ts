import { requireAdmin } from '../../server/auth.js'
import { resendGuestEmail } from '../../server/booking.js'

export async function POST(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  return resendGuestEmail(request)
}

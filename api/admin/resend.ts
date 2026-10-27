import { requireAdmin } from '../../server/auth.ts'
import { resendGuestEmail } from '../../server/booking.ts'

export async function POST(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  return resendGuestEmail(request)
}

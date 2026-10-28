import { requireAdmin } from '../../server/auth.js'
import { createManualBlock, deleteManualBlock } from '../../server/booking.js'

export async function POST(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  return createManualBlock(request)
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  return deleteManualBlock(request)
}

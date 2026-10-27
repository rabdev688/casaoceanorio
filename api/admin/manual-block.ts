import { requireAdmin } from '../../server/auth.ts'
import { createManualBlock, deleteManualBlock } from '../../server/booking.ts'

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

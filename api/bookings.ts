import { createWebsiteBooking } from '../server/booking.ts'

export function POST(request: Request) {
  return createWebsiteBooking(request)
}

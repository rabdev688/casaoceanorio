import { createWebsiteBooking } from '../server/booking.js'

export function POST(request: Request) {
  return createWebsiteBooking(request)
}

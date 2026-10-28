import { getAvailability } from '../server/availability.js'

export function GET(request: Request) {
  return getAvailability(request)
}

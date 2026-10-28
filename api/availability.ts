import { getAvailability } from '../server/availability.ts'

export function GET(request: Request) {
  return getAvailability(request)
}

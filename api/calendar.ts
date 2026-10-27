import { getCalendar } from '../server/availability.ts'

export function GET(request: Request) {
  return getCalendar(request)
}

import { getCalendar } from '../server/availability.js'

export function GET(request: Request) {
  return getCalendar(request)
}

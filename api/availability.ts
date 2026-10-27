import { getAvailability } from '../server/availability.ts'

export function GET() {
  return getAvailability()
}

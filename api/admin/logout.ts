import { logout } from '../../server/auth.ts'

export function POST() {
  return logout()
}

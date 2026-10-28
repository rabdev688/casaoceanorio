import { logout } from '../../server/auth.js'

export function POST() {
  return logout()
}

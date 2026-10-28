import { login } from '../../server/auth.js'

export function POST(request: Request) {
  return login(request)
}

import { login } from '../../server/auth.ts'

export function POST(request: Request) {
  return login(request)
}

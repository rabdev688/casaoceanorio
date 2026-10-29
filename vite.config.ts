import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

const agentManifestPaths = new Set([
  '/.well-known/ard.json',
  '/.well-known/ai-catalog.json',
])

function apiFile(pathname: string) {
  const route = pathname === '/api/calendar.ics' ? '/api/calendar' : pathname
  if (!route.startsWith('/api/')) return null
  const relative = route.slice('/api/'.length)
  if (!relative || relative.includes('..')) return null
  const file = path.join(rootDir, 'api', `${relative}.ts`)
  return fs.existsSync(file) ? file : null
}

async function toWebRequest(req: IncomingMessage) {
  const host = req.headers.host || 'localhost'
  const method = (req.method || 'GET').toUpperCase()
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null) continue
    if (key === 'transfer-encoding' || key === 'content-length' || key === 'connection') continue
    headers.set(key, Array.isArray(value) ? value.join(', ') : value)
  }
  const hasBody = method !== 'GET' && method !== 'HEAD'
  const body = hasBody ? Buffer.concat(await readChunks(req)) : undefined
  return new Request(`http://${host}${req.url || '/'}`, { method, headers, body })
}

function readChunks(req: IncomingMessage) {
  return new Promise<Buffer[]>((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(chunks))
    req.on('error', reject)
  })
}

async function writeResponse(res: ServerResponse, response: Response) {
  res.statusCode = response.status
  const cookies = response.headers.getSetCookie?.() ?? []
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') return
    res.setHeader(key, value)
  })
  if (cookies.length > 0) res.setHeader('set-cookie', cookies)
  res.end(Buffer.from(await response.arrayBuffer()))
}

function casaApi(): Plugin {
  return {
    name: 'casa-api',
    configureServer(devServer) {
      devServer.middlewares.use(async (req, res, next) => {
        const pathname = (req.url || '/').split('?')[0] || '/'
        if (agentManifestPaths.has(pathname)) {
          res.statusCode = 404
          res.setHeader('content-type', 'text/plain; charset=utf-8')
          res.end('Not found')
          return
        }
        if (!pathname.startsWith('/api/')) {
          next()
          return
        }
        try {
          const file = apiFile(pathname)
          if (!file) {
            res.statusCode = 404
            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify({ error: 'Not found' }))
            return
          }
          const loaded = (await devServer.ssrLoadModule(file)) as Record<string, unknown>
          const method = (req.method || 'GET').toUpperCase()
          const handler = loaded[method]
          if (typeof handler !== 'function') {
            res.statusCode = 405
            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }
          const response = await (handler as (request: Request) => Promise<Response> | Response)(
            await toWebRequest(req),
          )
          await writeResponse(res, response)
        } catch (error) {
          console.error(error)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify({ error: 'Server error' }))
          }
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), casaApi()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '5173'),
    strictPort: true,
  },
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '5173'),
  },
})

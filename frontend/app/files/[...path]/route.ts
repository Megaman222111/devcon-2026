import { promises as fs } from 'node:fs'
import path from 'node:path'
import { NextResponse } from 'next/server'

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json',
  '.pdf': 'application/pdf',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
}

interface RouteContext {
  params: Promise<{ path: string[] }>
}

export async function GET(_req: Request, { params }: RouteContext) {
  const { path: segments } = await params
  if (!segments || segments.length === 0) {
    return new NextResponse('Not found', { status: 404 })
  }

  const filesRoot = path.resolve(path.join(process.cwd(), '..', 'files'))
  const requested = path.resolve(path.join(filesRoot, ...segments))

  if (!requested.startsWith(filesRoot + path.sep) && requested !== filesRoot) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const stat = await fs.stat(requested)
    if (!stat.isFile()) {
      return new NextResponse('Not found', { status: 404 })
    }

    const data = await fs.readFile(requested)
    const ext = path.extname(requested).toLowerCase()
    const contentType = MIME_TYPES[ext] ?? 'application/octet-stream'

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}

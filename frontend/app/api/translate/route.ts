import { NextResponse } from 'next/server'

const DEFAULT_TIMEOUT_MS = 120_000

function getBackendUrl() {
  return process.env.AI_BACKEND_URL?.replace(/\/$/, '') ?? ''
}

export async function POST(request: Request) {
  const backend = getBackendUrl()
  if (!backend) {
    return NextResponse.json(
      { error: 'AI_BACKEND_URL is not configured.' },
      { status: 500 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

  try {
    const response = await fetch(`${backend}/api/translate/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: controller.signal,
    })
    const text = await response.text()
    return new NextResponse(text, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError'
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      {
        error: aborted ? 'Translation timed out' : 'Translation backend unreachable',
        detail: message,
        backend,
      },
      { status: aborted ? 504 : 502 }
    )
  } finally {
    clearTimeout(timer)
  }
}

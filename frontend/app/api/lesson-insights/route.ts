import { NextResponse } from 'next/server'

const DEFAULT_TIMEOUT_MS = 240_000

function getBackendUrl() {
  return process.env.AI_BACKEND_URL?.replace(/\/$/, '') ?? ''
}

const fallbackInsights = {
  keyIdeas: ['Review the section and focus on core concepts and practical terms.'],
  keywords: [
    { english: 'security professional', french: 'professionnel de la securite' },
    { english: 'observation', french: 'observation' },
    { english: 'reporting', french: 'rapport' },
    { english: 'compliance', french: 'conformite' },
    { english: 'safety', french: 'securite' },
  ],
}

export async function POST(request: Request) {
  const backend = getBackendUrl()
  if (!backend) {
    return NextResponse.json(fallbackInsights)
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
    const response = await fetch(`${backend}/api/lesson-insights/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: controller.signal,
    })
    if (!response.ok) {
      return NextResponse.json(fallbackInsights)
    }
    const text = await response.text()
    return new NextResponse(text, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return NextResponse.json(fallbackInsights)
  } finally {
    clearTimeout(timer)
  }
}

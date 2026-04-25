import { NextResponse } from 'next/server'

interface GoogleTranslateResponse {
  0?: Array<[string, string, unknown, unknown]>
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { text?: string; targetLang?: string }
    const text = body.text?.trim()
    const targetLang = body.targetLang?.trim() || 'es'

    if (!text) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 })
    }

    const endpoint = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`
    const response = await fetch(endpoint, { cache: 'no-store' })
    if (!response.ok) {
      return NextResponse.json({ error: 'Translation request failed' }, { status: 502 })
    }

    const data = (await response.json()) as GoogleTranslateResponse
    const translatedText = (data[0] ?? []).map((chunk) => chunk[0]).join('')
    return NextResponse.json({ translatedText })
  } catch {
    return NextResponse.json({ error: 'Unexpected translation error' }, { status: 500 })
  }
}

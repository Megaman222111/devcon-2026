import { NextResponse } from 'next/server'

interface GeminiPart {
  text?: string
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[]
  }
}

interface GeminiResponse {
  candidates?: GeminiCandidate[]
}

interface InsightsPayload {
  keywords?: string[]
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

async function translateToFrench(text: string) {
  const endpoint = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=fr&dt=t&q=${encodeURIComponent(text)}`
  const response = await fetch(endpoint, { cache: 'no-store' })
  if (!response.ok) return text
  const data = (await response.json()) as Array<Array<[string]>>
  return (data[0] ?? []).map((chunk) => chunk[0]).join('') || text
}

export async function POST(request: Request) {
  try {
    const { text, heading } = (await request.json()) as { text?: string; heading?: string }
    if (!text?.trim()) {
      return NextResponse.json({ error: 'Missing section text' }, { status: 400 })
    }

    const apiKey = process.env.TRANSLATION_GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(fallbackInsights)
    }

    const prompt = [
      'You are helping learners review lesson content.',
      'Given a lesson section, return concise keywords in strict JSON.',
      'The output must stay tightly grounded in the provided section text only.',
      'Output schema:',
      '{"keywords": string[15-25]}',
      'Rules:',
      '- Make keywords generous, but every keyword must be directly about concepts, terms, actions, laws, or procedures in this section.',
      '- Do not add generic filler keywords unrelated to the section.',
      '- Prefer noun phrases and high-value study terms.',
      '- Return keywords in English only.',
      '- Keep terminology faithful to the original meaning.',
      '- Do not include markdown fencing or extra text.',
      '',
      `Section heading: ${heading ?? 'Lesson Section'}`,
      'Section content:',
      text,
    ].join('\n')

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        }),
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      return NextResponse.json(fallbackInsights)
    }

    const data = (await response.json()) as GeminiResponse
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!raw) {
      return NextResponse.json(fallbackInsights)
    }

    const parsed = JSON.parse(raw) as InsightsPayload
    const keywords = Array.isArray(parsed.keywords)
      ? parsed.keywords.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : []

    const translatedKeywords = await Promise.all(
      (keywords.length > 0 ? keywords : fallbackInsights.keywords.map((item) => item.english)).map(async (keyword) => ({
        english: keyword,
        french: await translateToFrench(keyword),
      }))
    )

    return NextResponse.json({
      keyIdeas: fallbackInsights.keyIdeas,
      keywords: translatedKeywords,
    })
  } catch {
    return NextResponse.json(fallbackInsights)
  }
}

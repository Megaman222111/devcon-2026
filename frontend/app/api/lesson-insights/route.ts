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

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

function extractLiteralKeywordsFromText(text: string, limit = 20) {
  const stopWords = new Set([
    'that', 'this', 'with', 'from', 'into', 'there', 'their', 'about', 'where', 'which', 'while', 'would',
    'could', 'should', 'have', 'been', 'were', 'they', 'them', 'your', 'yours', 'what', 'when', 'will', 'than',
    'only', 'very', 'just', 'also', 'must', 'such', 'each', 'more', 'most', 'some', 'many', 'much', 'like',
  ])
  const phraseMatches = text.match(/\b[A-Za-z][A-Za-z'-]{2,}(?:\s+[A-Za-z][A-Za-z'-]{2,}){1,3}\b/g) ?? []
  const singleMatches = text.match(/\b[A-Za-z][A-Za-z'-]{5,}\b/g) ?? []
  const seen = new Set<string>()
  const keywords: string[] = []

  for (const match of [...phraseMatches, ...singleMatches]) {
    const normalized = normalizeText(match).replace(/[^a-z'\s-]/g, '')
    if (!normalized || seen.has(normalized)) continue
    if (normalized.split(' ').some((token) => stopWords.has(token))) continue
    seen.add(normalized)
    keywords.push(match.trim())
    if (keywords.length >= limit) break
  }

  if (keywords.length === 0) {
    for (const match of singleMatches) {
      const normalized = normalizeText(match)
      if (seen.has(normalized)) continue
      if (stopWords.has(normalized)) continue
      seen.add(normalized)
      keywords.push(match.trim())
      if (keywords.length >= Math.min(8, limit)) break
    }
  }

  return keywords
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

    const extractedFallback = extractLiteralKeywordsFromText(text)

    const apiKey = process.env.TRANSLATION_GEMINI_API_KEY
    if (!apiKey) {
      const translatedKeywords = await Promise.all(
        extractedFallback.map(async (keyword) => ({
          english: keyword,
          french: await translateToFrench(keyword),
        }))
      )
      return NextResponse.json({
        keyIdeas: fallbackInsights.keyIdeas,
        keywords: translatedKeywords.length > 0 ? translatedKeywords : fallbackInsights.keywords,
      })
    }

    const prompt = [
      'You are helping learners review lesson content.',
      'Given a lesson section, return concise keywords in strict JSON.',
      'The output must stay tightly grounded in the provided section text only.',
      'Every keyword must be copied EXACTLY from the section text (same words, no paraphrasing).',
      'Output schema:',
      '{"keywords": string[15-25]}',
      'Rules:',
      '- Make keywords generous, but every keyword must be a literal substring present in the section content.',
      '- Do not invent, paraphrase, stem, or reword any keyword.',
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
      const translatedKeywords = await Promise.all(
        extractedFallback.map(async (keyword) => ({
          english: keyword,
          french: await translateToFrench(keyword),
        }))
      )
      return NextResponse.json({
        keyIdeas: fallbackInsights.keyIdeas,
        keywords: translatedKeywords.length > 0 ? translatedKeywords : fallbackInsights.keywords,
      })
    }

    const data = (await response.json()) as GeminiResponse
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!raw) {
      const translatedKeywords = await Promise.all(
        extractedFallback.map(async (keyword) => ({
          english: keyword,
          french: await translateToFrench(keyword),
        }))
      )
      return NextResponse.json({
        keyIdeas: fallbackInsights.keyIdeas,
        keywords: translatedKeywords.length > 0 ? translatedKeywords : fallbackInsights.keywords,
      })
    }

    const parsed = JSON.parse(raw) as InsightsPayload
    const sourceTextNormalized = normalizeText(text)
    const keywordsRaw = Array.isArray(parsed.keywords)
      ? parsed.keywords.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : []
    const seen = new Set<string>()
    const literalKeywords = keywordsRaw.filter((keyword) => {
      const normalizedKeyword = normalizeText(keyword)
      if (!normalizedKeyword) return false
      if (seen.has(normalizedKeyword)) return false
      if (!sourceTextNormalized.includes(normalizedKeyword)) return false
      if (normalizedKeyword.length < 4) return false
      const tokenCount = normalizedKeyword.split(' ').length
      if (tokenCount === 1) {
        const wordRegex = new RegExp(`\\b${normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
        const matches = text.match(wordRegex)
        if (!matches || matches.length < 2) return false
      }
      seen.add(normalizedKeyword)
      return true
    })
    const keywords = literalKeywords.length > 0 ? literalKeywords : extractedFallback

    const translatedKeywords = await Promise.all(
      (keywords.length > 0 ? keywords : extractedFallback).map(async (keyword) => ({
        english: keyword,
        french: await translateToFrench(keyword),
      }))
    )

    return NextResponse.json({
      keyIdeas: fallbackInsights.keyIdeas,
      keywords: translatedKeywords.length > 0 ? translatedKeywords : fallbackInsights.keywords,
    })
  } catch {
    return NextResponse.json(fallbackInsights)
  }
}

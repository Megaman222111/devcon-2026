import { NextResponse } from 'next/server'

interface GeminiPart {
  text?: string
  inlineData?: {
    mimeType: string
    data: string
  }
}

interface GeminiContent {
  role?: 'user' | 'model'
  parts?: GeminiPart[]
}

interface GeminiResponse {
  candidates?: { content?: GeminiContent; finishReason?: string }[]
  promptFeedback?: { blockReason?: string }
}

interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  question?: string
  history?: ChatTurn[]
  pdf?: { name?: string; mimeType?: string; data?: string } | null
}

const SYSTEM_INSTRUCTION = [
  'You are a careful study assistant answering questions about a PDF the user uploaded.',
  '',
  'Accuracy rules — follow them strictly:',
  '1. Ground every answer in the contents of the attached PDF. Do not use outside knowledge or make assumptions.',
  '2. If the PDF does not contain the information needed, reply: "I could not find that in the document." Then suggest one or two related topics that ARE in the document, if any.',
  '3. Quote short phrases from the PDF in double quotes when helpful so the user can verify.',
  '4. Cite the page number in parentheses like (p. 4) when identifiable. If a page number is not visible, cite the section or heading instead, e.g. (Section: "Reporting Procedures"). Never guess a citation.',
  '5. Keep answers concise (3-6 sentences by default). Use short bullet lists for steps or comparisons.',
  '6. If the user asks a multi-part question, answer each part separately.',
  '7. For summary requests, use bullet points organized by topic.',
  '8. Preserve the document\'s exact terminology; do not paraphrase technical terms loosely.',
  '9. If asked something unrelated to the document, briefly answer if possible but make clear it is not from the PDF.',
  '',
  'Tone: clear, direct, friendly. No filler like "Great question" or "Certainly".',
].join('\n')

const MAX_PDF_BYTES = 18 * 1024 * 1024

function decodeBase64Length(base64: string) {
  const cleaned = base64.replace(/=+$/, '')
  return Math.floor((cleaned.length * 3) / 4)
}

export async function POST(request: Request) {
  let body: ChatRequest
  try {
    body = (await request.json()) as ChatRequest
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const question = body.question?.trim()
  if (!question) {
    return NextResponse.json({ error: 'Missing question' }, { status: 400 })
  }

  const apiKey = process.env.TRANSLATION_GEMINI_API_KEY ?? process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Gemini API key is not configured on the server.' },
      { status: 500 }
    )
  }

  const pdfData = body.pdf?.data?.trim()
  const pdfMimeType = body.pdf?.mimeType ?? 'application/pdf'

  if (pdfData && decodeBase64Length(pdfData) > MAX_PDF_BYTES) {
    return NextResponse.json(
      { error: 'PDF is too large. Please upload a file under 18 MB.' },
      { status: 413 }
    )
  }

  const history = Array.isArray(body.history) ? body.history.slice(-12) : []

  const contents: GeminiContent[] = []

  for (const turn of history) {
    const text = typeof turn.content === 'string' ? turn.content.trim() : ''
    if (!text) continue
    contents.push({
      role: turn.role === 'assistant' ? 'model' : 'user',
      parts: [{ text }],
    })
  }

  const userParts: GeminiPart[] = []
  if (pdfData) {
    userParts.push({ inlineData: { mimeType: pdfMimeType, data: pdfData } })
  }
  userParts.push({ text: question })
  contents.push({ role: 'user', parts: userParts })

  const requestBody = {
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents,
    generationConfig: {
      temperature: 0.2,
      topP: 0.9,
      maxOutputTokens: 1024,
    },
  }

  let response: Response
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        cache: 'no-store',
      }
    )
  } catch {
    return NextResponse.json(
      { error: 'Could not reach the Gemini API. Please try again.' },
      { status: 502 }
    )
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    return NextResponse.json(
      {
        error: 'Gemini returned an error.',
        detail: errorText.slice(0, 500),
        status: response.status,
      },
      { status: 502 }
    )
  }

  const data = (await response.json()) as GeminiResponse
  const blockReason = data.promptFeedback?.blockReason
  if (blockReason) {
    return NextResponse.json(
      { error: `Request was blocked: ${blockReason}` },
      { status: 400 }
    )
  }

  const answer = (data.candidates?.[0]?.content?.parts ?? [])
    .map((part) => part.text ?? '')
    .join('')
    .trim()

  if (!answer) {
    return NextResponse.json(
      { error: 'No answer was returned. Try rephrasing your question.' },
      { status: 502 }
    )
  }

  return NextResponse.json({ answer })
}

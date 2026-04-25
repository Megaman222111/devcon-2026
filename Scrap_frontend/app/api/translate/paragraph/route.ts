import { NextResponse } from 'next/server'
import { getLanguageByCode, type LanguageCode } from '@/data/languages'

const glossary: Record<string, Partial<Record<LanguageCode, string>>> = {
  security: { tl: 'seguridad', es: 'seguridad', fr: 'sécurité', ar: 'الأمن', hi: 'सुरक्षा', ur: 'سیکیورٹی' },
  licence: { tl: 'lisensya', es: 'licencia', fr: 'permis', ar: 'ترخيص', hi: 'लाइसेंस', ur: 'لائسنس' },
  licensee: { tl: 'may lisensya', es: 'licenciatario', fr: 'titulaire de permis', ar: 'صاحب الترخيص', hi: 'लाइसेंसधारी', ur: 'لائسنس یافتہ' },
  registrar: { tl: 'registrar', es: 'registrador', fr: 'registraire', ar: 'المسجل', hi: 'रजिस्ट्रार', ur: 'رجسٹرار' },
  compliance: { tl: 'pagsunod', es: 'cumplimiento', fr: 'conformité', ar: 'الامتثال', hi: 'अनुपालन', ur: 'تعمیل' },
}

function translateText(text: string, targetLanguage: LanguageCode) {
  let translated = text
  Object.entries(glossary).forEach(([english, translations]) => {
    const replacement = translations[targetLanguage]
    if (!replacement) return
    const regex = new RegExp(`\\b${english}\\b`, 'gi')
    translated = translated.replace(regex, replacement)
  })

  const label = getLanguageByCode(targetLanguage).name
  return `[${label}] ${translated}`
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    paragraphId?: string
    text?: string
    targetLanguage?: LanguageCode
  }

  if (!body.text?.trim()) {
    return NextResponse.json({ error: 'Missing text' }, { status: 400 })
  }

  const targetLanguage = body.targetLanguage ?? 'es'
  return NextResponse.json({
    paragraphId: body.paragraphId,
    translatedText: translateText(body.text, targetLanguage),
  })
}

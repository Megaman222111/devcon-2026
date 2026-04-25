export type LanguageCode =
  | 'en'
  | 'tl'
  | 'hi'
  | 'ur'
  | 'zh'
  | 'ko'
  | 'vi'
  | 'es'
  | 'pt'
  | 'fr'
  | 'ar'
  | 'ja'

export interface SupportedLanguage {
  code: LanguageCode
  name: string
  nativeScript: string | null
  flag: string
  awsCode: string
  rtl?: boolean
}

export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
  { code: 'en', name: 'English', nativeScript: null, flag: '🇨🇦', awsCode: 'en' },
  { code: 'tl', name: 'Tagalog', nativeScript: 'Filipino', flag: '🇵🇭', awsCode: 'tl' },
  { code: 'hi', name: 'Hindi', nativeScript: 'हिन्दी', flag: '🇮🇳', awsCode: 'hi' },
  { code: 'ur', name: 'Urdu', nativeScript: 'اردو', flag: '🇵🇰', awsCode: 'ur', rtl: true },
  { code: 'zh', name: 'Mandarin', nativeScript: '普通话', flag: '🇨🇳', awsCode: 'zh' },
  { code: 'ko', name: 'Korean', nativeScript: '한국어', flag: '🇰🇷', awsCode: 'ko' },
  { code: 'vi', name: 'Vietnamese', nativeScript: 'Tiếng Việt', flag: '🇻🇳', awsCode: 'vi' },
  { code: 'es', name: 'Spanish', nativeScript: 'Español', flag: '🇪🇸', awsCode: 'es' },
  { code: 'pt', name: 'Portuguese', nativeScript: 'Português', flag: '🇧🇷', awsCode: 'pt' },
  { code: 'fr', name: 'French', nativeScript: null, flag: '🇫🇷', awsCode: 'fr' },
  { code: 'ar', name: 'Arabic', nativeScript: 'العربية', flag: '🇸🇦', awsCode: 'ar', rtl: true },
  { code: 'ja', name: 'Japanese', nativeScript: '日本語', flag: '🇯🇵', awsCode: 'ja' },
]

export const DEFAULT_LANGUAGE_CODE: LanguageCode = 'en'

export function getLanguageByCode(code: LanguageCode | string | null | undefined): SupportedLanguage {
  return (
    SUPPORTED_LANGUAGES.find((language) => language.code === code) ??
    SUPPORTED_LANGUAGES[0]
  )
}

export function isLanguageRTL(code: LanguageCode | string | null | undefined) {
  return Boolean(getLanguageByCode(code).rtl)
}

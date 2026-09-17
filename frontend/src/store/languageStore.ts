import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LanguageCode, translations, SUPPORTED_LANGUAGES } from '@/i18n/translations'

interface LanguageState {
  currentLanguage: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  t: (key: string, fallback?: string) => string
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: 'en',
      setLanguage: (lang: LanguageCode) => {
        set({ currentLanguage: lang })
        if (typeof document !== 'undefined') {
          const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === lang)
          document.documentElement.lang = lang
          document.documentElement.dir = langMeta?.dir || 'ltr'
        }
      },
      t: (key: string, fallback?: string) => {
        const lang = get().currentLanguage
        const dict = translations[lang] || translations.en
        return dict[key] || fallback || translations.en[key] || key
      },
    }),
    {
      name: 'vajra-language-storage',
    }
  )
)

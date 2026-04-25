import { useLanguage } from '../contexts/LanguageContext'

export function useTranslation() {
    const { t, translateText, currentLang, liveTranslationEnabled, translating, setTranslating } = useLanguage()

    const translateContent = async (text) => {
        if (!text || currentLang === 'en' || !liveTranslationEnabled) {
            return text
        }

        setTranslating(true)
        try {
            const translated = await translateText(text, currentLang)
            return translated
        } finally {
            setTranslating(false)
        }
    }

    return {
        t,
        translateText,
        translateContent,
        currentLang,
        liveTranslationEnabled,
        translating,
    }
}

export { useLanguage }

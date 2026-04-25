import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { translations } from '../utils/translations'

const LanguageContext = createContext(null)

const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
]

export function LanguageProvider({ children }) {
    const [currentLang, setCurrentLang] = useState(() => {
        const saved = localStorage.getItem('hail-language')
        return saved || 'en'
    })
    const [liveTranslationEnabled, setLiveTranslationEnabled] = useState(() => {
        const saved = localStorage.getItem('hail-live-translation')
        return saved === 'true'
    })
    const [translating, setTranslating] = useState(false)

    useEffect(() => {
        localStorage.setItem('hail-language', currentLang)
    }, [currentLang])

    useEffect(() => {
        localStorage.setItem('hail-live-translation', liveTranslationEnabled)
    }, [liveTranslationEnabled])

    const t = useCallback((key, params = {}) => {
        // First try flattened key directly (e.g., 'priorities.lifestyle.0')
        let value = translations[currentLang]?.[key]
        
        // If not found, try nested access (e.g., 'form.step0.title')
        if (value === undefined) {
            const keys = key.split('.')
            value = translations[currentLang]
            for (const k of keys) {
                value = value?.[k]
                if (value === undefined) break
            }
        }
        
        // Fallback to English
        if (value === undefined) {
            value = translations.en?.[key]
        }
        
        if (value === undefined) {
            const keys = key.split('.')
            value = translations.en
            for (const k of keys) {
                value = value?.[k]
                if (value === undefined) break
            }
        }
        
        if (typeof value === 'string' && params) {
            return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
                return params[paramKey] !== undefined ? params[paramKey] : match
            })
        }
        
        return value || key
    }, [currentLang])

    const translateText = useCallback(async (text, targetLang = currentLang) => {
        if (!text || targetLang === 'en') return text
        
        try {
            const response = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
            )
            const data = await response.json()
            
            if (data.responseData?.translatedText) {
                return data.responseData.translatedText
            }
            return text
        } catch (error) {
            console.error('Translation error:', error)
            return text
        }
    }, [currentLang])

    const value = {
        currentLang,
        setLanguage: setCurrentLang,
        languages: SUPPORTED_LANGUAGES,
        t,
        translateText,
        liveTranslationEnabled,
        setLiveTranslationEnabled,
        translating,
        setTranslating,
        isRTL: ['ar', 'he', 'ur'].includes(currentLang),
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}

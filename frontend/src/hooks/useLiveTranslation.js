import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

export function useLiveTranslation() {
    const { translateText, currentLang, liveTranslationEnabled } = useLanguage()
    const [translations, setTranslations] = useState({})
    const [translating, setTranslating] = useState(false)

    const translateContent = useCallback(async (text, id) => {
        if (!text || currentLang === 'en' || !liveTranslationEnabled) {
            return text
        }

        // Check cache first
        if (translations[id] && translations[id].source === text) {
            return translations[id].translated
        }

        setTranslating(true)
        try {
            const translated = await translateText(text, currentLang)
            setTranslations(prev => ({
                ...prev,
                [id]: { source: text, translated }
            }))
            return translated
        } finally {
            setTranslating(false)
        }
    }, [currentLang, liveTranslationEnabled, translateText, translations])

    const getTranslatedText = useCallback((text, id) => {
        if (!liveTranslationEnabled || currentLang === 'en') return text
        if (translations[id] && translations[id].source === text) {
            return translations[id].translated
        }
        return text
    }, [translations, currentLang, liveTranslationEnabled])

    return {
        translateContent,
        getTranslatedText,
        translating,
        translations
    }
}

// Currency formatter hook
export function useCurrency() {
    const { currentLang } = useLanguage()
    
    const formatCurrency = useCallback((amount, currency = null) => {
        // Auto-detect currency based on language
        let curr = currency
        if (!curr) {
            switch (currentLang) {
                case 'hi':
                case 'ta':
                    curr = 'INR'
                    break
                case 'en':
                default:
                    curr = 'USD'
                    break
            }
        }
        
        const symbols = {
            'USD': '$',
            'INR': '₹',
            'EUR': '€',
            'GBP': '£',
            'JPY': '¥',
        }
        
        const symbol = symbols[curr] || curr
        return `${symbol}${amount?.toLocaleString?.() || amount}`
    }, [currentLang])
    
    // Convert currency text in strings (e.g., "$500" to "₹500")
    const convertCurrencyInText = useCallback((text) => {
        if (!text || currentLang === 'en') return text
        
        // Convert $ to ₹ for Indian languages
        if (currentLang === 'hi' || currentLang === 'ta') {
            return text.replace(/\$(\d[\d,]*)/g, '₹$1')
        }
        return text
    }, [currentLang])
    
    return { formatCurrency, convertCurrencyInText }
}

import React, { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

export default function LanguageSwitcher() {
    const { currentLang, setLanguage, languages, t, liveTranslationEnabled, setLiveTranslationEnabled } = useLanguage()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    const currentLanguage = languages.find(l => l.code === currentLang) || languages[0]

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLanguageSelect = (langCode) => {
        setLanguage(langCode)
        setIsOpen(false)
    }

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                className="btn btn-ghost btn-sm"
                onClick={() => setIsOpen(!isOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                title={t('language.title')}
            >
                <span>{currentLanguage.flag}</span>
                <span style={{ fontSize: '0.8rem' }}>{currentLanguage.code.toUpperCase()}</span>
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    zIndex: 1000,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    minWidth: 220,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(20px)',
                }}>
                    <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: 10,
                        padding: '0 4px',
                    }}>
                        {t('language.title')}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageSelect(lang.code)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '8px 12px',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    background: currentLang === lang.code ? 'var(--accent-glow)' : 'transparent',
                                    color: currentLang === lang.code ? 'var(--accent)' : 'var(--text-primary)',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <span style={{ fontSize: '1.1rem' }}>{lang.flag}</span>
                                <span style={{ fontWeight: currentLang === lang.code ? 600 : 400 }}>
                                    {lang.name}
                                </span>
                                {currentLang === lang.code && (
                                    <span style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>✓</span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: '1px solid var(--border)',
                    }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '8px 4px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                        }}>
                            <input
                                type="checkbox"
                                checked={liveTranslationEnabled}
                                onChange={(e) => setLiveTranslationEnabled(e.target.checked)}
                                style={{ cursor: 'pointer' }}
                            />
                            <div>
                                <div style={{ fontWeight: 500 }}>{t('language.liveTranslation')}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {t('language.liveTranslationDesc')}
                                </div>
                            </div>
                        </label>
                    </div>
                </div>
            )}
        </div>
    )
}

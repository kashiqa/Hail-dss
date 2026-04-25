import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'

const FEATURE_ICONS = ['🎯', '🔍', '🔐', '📊']
const CATEGORY_ICONS = {
    career: '💼',
    education: '🎓',
    finance: '💰',
    lifestyle: '🌿',
}

const CATEGORY_KEYS = ['career', 'education', 'finance', 'lifestyle']

export default function Dashboard({ onStart }) {
    const { t } = useLanguage()

    const features = [
        { key: 'structuredReasoning' },
        { key: 'explainableAI' },
        { key: 'privacyFirst' },
        { key: 'richVisualizations' },
    ]

    return (
        <div className="relative animate-fade">
            {/* ── Hero ────────────────────────────────────────────── */}
            <section style={{ padding: '80px 24px 60px', textAlign: 'center', position: 'relative' }}>
                {/* Glow orbs */}
                <div style={{ position: 'absolute', top: 60, left: '20%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, var(--accent-glow), transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 120, right: '18%', width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, var(--accent2-glow), transparent 70%)', pointerEvents: 'none' }} />

                <div className="relative">
                    <span className="badge badge-accent" style={{ marginBottom: 20 }}>{t('dashboard.badge')}</span>
                    <h1 style={{ marginBottom: 20 }}>
                        {t('dashboard.title')}<br />
                        <span style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {t('dashboard.subtitle')}
                        </span>
                    </h1>
                    <p style={{ maxWidth: 560, margin: '0 auto 40px', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                        {t('dashboard.description')}
                    </p>
                    <button className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '14px 36px' }} onClick={onStart}>
                        {t('dashboard.startButton')}
                    </button>
                </div>
            </section>

            {/* ── Category Cards ───────────────────────────────────── */}
            <section className="container" style={{ marginBottom: 64 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
                    {CATEGORY_KEYS.map((key, idx) => (
                        <div
                            key={key}
                            className="card"
                            style={{ padding: 24, cursor: 'pointer', textAlign: 'center' }}
                            onClick={onStart}
                            tabIndex={0}
                            role="button"
                            onKeyDown={e => e.key === 'Enter' && onStart()}
                        >
                            <div style={{ fontSize: 36, marginBottom: 10 }}>{CATEGORY_ICONS[key]}</div>
                            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.05rem', marginBottom: 6 }}>{t(`categories.${key}.label`)}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t(`categories.${key}.desc`)}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Feature Grid ─────────────────────────────────────── */}
            <section className="container" style={{ marginBottom: 80 }}>
                <h2 style={{ textAlign: 'center', marginBottom: 36 }}>{t('dashboard.howItWorks')}</h2>
                <div className="grid-2">
                    {features.map((f, idx) => (
                        <div key={f.key} className="glass" style={{ padding: 28, display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                            <span style={{ fontSize: 26, flexShrink: 0 }}>{FEATURE_ICONS[idx]}</span>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>{t(`features.${f.key}.title`)}</div>
                                <p style={{ fontSize: '0.9rem', margin: 0 }}>{t(`features.${f.key}.desc`)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

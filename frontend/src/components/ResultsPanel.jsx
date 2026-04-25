import React, { useEffect, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useLiveTranslation, useCurrency } from '../hooks/useLiveTranslation'
import DecisionChart from './DecisionChart'

const RANK_ICONS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']
const RANK_COLORS = ['var(--accent)', 'var(--accent2)', 'var(--success)', 'var(--warning)', 'var(--text-muted)']

const DIMENSION_KEYS = {
    'financial feasibility': 'dimensions.financialFeasibility',
    'financial_feasibility': 'dimensions.financialFeasibility',
    'risk alignment': 'dimensions.riskAlignment',
    'risk_alignment': 'dimensions.riskAlignment',
    'time alignment': 'dimensions.timeAlignment',
    'time_alignment': 'dimensions.timeAlignment',
    'career alignment': 'dimensions.careerAlignment',
    'career_alignment': 'dimensions.careerAlignment',
    'growth potential': 'dimensions.growthPotential',
    'growth_potential': 'dimensions.growthPotential',
    'personal fit': 'dimensions.personalFit',
    'personal_fit': 'dimensions.personalFit',
}

export default function ResultsPanel({ result, onReset }) {
    const { t, translateText, currentLang, liveTranslationEnabled } = useLanguage()
    const { convertCurrencyInText } = useCurrency()
    const [translatedContent, setTranslatedContent] = useState({})
    const [translating, setTranslating] = useState(false)
    
    if (!result) return null
    const { goal, ranked_paths, summary } = result
    
    // Live translation effect for AI-generated content
    useEffect(() => {
        if (!liveTranslationEnabled || currentLang === 'en') {
            setTranslatedContent({})
            return
        }
        
        const translateAll = async () => {
            setTranslating(true)
            const translations = {}
            
            for (let i = 0; i < ranked_paths.length; i++) {
                const p = ranked_paths[i]
                
                // Translate explanation
                if (p.explanation) {
                    const translated = await translateText(p.explanation, currentLang)
                    translations[`explanation_${i}`] = convertCurrencyInText(translated)
                }
                
                // Translate pros
                for (let j = 0; j < p.pros.length; j++) {
                    const translated = await translateText(p.pros[j], currentLang)
                    translations[`pro_${i}_${j}`] = convertCurrencyInText(translated)
                }
                
                // Translate cons
                for (let j = 0; j < p.cons.length; j++) {
                    const translated = await translateText(p.cons[j], currentLang)
                    translations[`con_${i}_${j}`] = convertCurrencyInText(translated)
                }
                
                // Translate summary
                if (summary && i === 0) {
                    const translated = await translateText(summary, currentLang)
                    translations['summary'] = convertCurrencyInText(translated)
                }
            }
            
            setTranslatedContent(translations)
            setTranslating(false)
        }
        
        translateAll()
    }, [result, currentLang, liveTranslationEnabled, translateText, convertCurrencyInText, ranked_paths, summary])
    
    const getText = (original, key) => {
        if (liveTranslationEnabled && translatedContent[key]) {
            return translatedContent[key]
        }
        return convertCurrencyInText(original)
    }

    return (
        <div className="container animate-fade" style={{ padding: '40px 24px', maxWidth: 900 }}>

            {/* ── Summary Banner ────────────────────────────────────── */}
            <div className="glass" style={{ padding: '24px 28px', marginBottom: 32, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 32, flexShrink: 0 }}>💡</span>
                <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 6 }}>{t('results.summaryTitle')}</div>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>
                        {translating && <span style={{ color: 'var(--text-muted)' }}>{t('language.translating')} </span>}
                        {getText(summary, 'summary')}
                    </p>
                </div>
            </div>

            {/* ── Charts ───────────────────────────────────────────── */}
            <div style={{ marginBottom: 32 }}>
                <DecisionChart rankedPaths={ranked_paths} />
            </div>

            {/* ── Ranked Cards ─────────────────────────────────────── */}
            <h2 style={{ marginBottom: 20 }}>{t('results.rankedTitle')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {ranked_paths.map((p, i) => (
                    <div key={p.option} className="card p-6" style={{ borderColor: i === 0 ? 'var(--accent)' : 'var(--border)', position: 'relative', overflow: 'hidden' }}>
                        {i === 0 && (
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,var(--accent),var(--accent2))' }} />
                        )}

                        {/* Option Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                                <span className="badge badge-ranked" style={{ background: i === 0 ? 'linear-gradient(135deg,var(--accent),var(--accent2))' : 'var(--bg-panel)', color: i === 0 ? '#fff' : 'var(--text-muted)', border: i === 0 ? 'none' : '1px solid var(--border)' }}>
                                    {RANK_ICONS[i]} {t(`results.rankLabels.${i}`)}
                                </span>
                                <h3 style={{ margin: 0 }}>{p.option}</h3>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.8rem', fontWeight: 800, color: RANK_COLORS[i] }}>
                                    {p.score_pct}%
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t('results.score')}</div>
                            </div>
                        </div>

                        {/* Score bar */}
                        <div className="score-bar-track" style={{ marginBottom: 8 }}>
                            <div className="score-bar-fill" style={{ width: `${p.score_pct}%` }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                            <span className="text-xs text-muted">{t('results.scoreLabel')}</span>
                            <span className="text-xs" style={{ color: 'var(--accent2)' }}>{t('results.confidence', { percent: p.confidence_pct })}</span>
                        </div>

                        {/* Dimension Scores */}
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>{t('results.dimensions')}</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10 }}>
                                {Object.entries(p.dimension_scores).map(([dim, val]) => {
                                    const dimKey = DIMENSION_KEYS[dim]
                                    const translatedDim = dimKey ? t(dimKey) : dim.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                                    return (
                                    <div key={dim} style={{ background: 'var(--bg-panel)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                                            {translatedDim}
                                        </div>
                                        <div className="score-bar-track" style={{ height: 5, marginBottom: 4 }}>
                                            <div className="score-bar-fill" style={{ width: `${val}%`, background: val >= 70 ? 'var(--success)' : val >= 45 ? 'var(--warning)' : 'var(--danger)' }} />
                                        </div>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: val >= 70 ? 'var(--success)' : val >= 45 ? 'var(--warning)' : 'var(--danger)' }}>{val}%</div>
                                    </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Pros & Cons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                            <div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--success)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>{t('results.pros')}</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {p.pros.length ? p.pros.map((pro, j) => (
                                        <span key={j} className="pill pro">
                                            ✓ {getText(pro, `pro_${i}_${j}`)}
                                        </span>
                                    )) : <span className="text-muted text-sm">{t('results.nonePros')}</span>}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--danger)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>{t('results.cons')}</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {p.cons.length ? p.cons.map((con, j) => (
                                        <span key={j} className="pill con">
                                            ! {getText(con, `con_${i}_${j}`)}
                                        </span>
                                    )) : <span className="text-muted text-sm">{t('results.noneCons')}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Explanation */}
                        <div style={{ background: 'var(--bg-panel)', borderRadius: 'var(--radius-md)', padding: '14px 16px', borderLeft: '3px solid var(--accent)' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>{t('results.explanation')}</div>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                {getText(p.explanation, `explanation_${i}`)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Actions ──────────────────────────────────────────── */}
            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 14 }}>
                <button className="btn btn-ghost" onClick={onReset}>{t('results.newDecision')}</button>
            </div>
        </div>
    )
}

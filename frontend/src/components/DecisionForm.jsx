import React, { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useCurrency } from '../hooks/useLiveTranslation'

const GOALS = [
    { id: 'career', icon: '💼', label: 'Career' },
    { id: 'education', icon: '🎓', label: 'Education' },
    { id: 'finance', icon: '💰', label: 'Finance' },
    { id: 'lifestyle', icon: '🌿', label: 'Lifestyle' },
]

const PRIORITIES_KEYS = {
    career: ['salary', 'growth', 'work-life balance', 'remote work', 'job security', 'creativity'],
    education: ['affordability', 'reputation', 'duration', 'online', 'employability', 'research'],
    finance: ['safety', 'liquidity', 'long term', 'tax saving', 'high returns', 'passive income'],
    lifestyle: ['health', 'family', 'travel', 'minimal effort', 'social connection', 'happiness'],
}

const OPTION_EXAMPLES = {
    career: ['Software Engineer at Startup', 'Product Manager at Tech Co', 'Freelance Designer', 'Consultant at Big4'],
    education: ['Masters in CS at Stanford', 'Data Science Bootcamp', 'Online Certificate', 'PhD in Economics'],
    finance: ['S&P 500 Index Fund', 'Real Estate Investment', 'Crypto Portfolio', 'High-Yield Savings'],
    lifestyle: ['Daily Yoga Routine', 'Switch to Vegan Diet', 'Morning Meditation', 'Weekly Hiking'],
}

const STEP_KEYS = ['Goal', 'Options', 'Constraints', 'Priorities']

export default function DecisionForm({ onSubmit, loading }) {
    const { t, currentLang } = useLanguage()
    const { formatCurrency } = useCurrency()
    
    // Helper to get currency symbol based on language
    const getCurrencySymbol = () => {
        return (currentLang === 'hi' || currentLang === 'ta') ? '₹' : '$'
    }
    
    // Convert placeholder examples to local currency
    const getPlaceholder = (baseNum) => {
        const symbol = getCurrencySymbol()
        return `e.g. ${symbol}${baseNum}`
    }
    const [step, setStep] = useState(0)
    const [form, setForm] = useState({
        goal: '',
        options: ['', ''],
        budget: '',
        riskTolerance: 'medium',
        timeMonths: '',
        priorities: [],
    })
    const [errors, setErrors] = useState({})

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

    const addOption = () => form.options.length < 5 && set('options', [...form.options, ''])
    const removeOption = i => form.options.length > 2 && set('options', form.options.filter((_, idx) => idx !== i))
    const setOption = (i, v) => set('options', form.options.map((o, idx) => idx === i ? v : o))

    const togglePriority = p => {
        const ps = form.priorities
        set('priorities', ps.includes(p) ? ps.filter(x => x !== p) : ps.length < 5 ? [...ps, p] : ps)
    }

    const validate = () => {
        const e = {}
        if (step === 0 && !form.goal) e.goal = t('form.step0.error')
        if (step === 1) {
            const valid = form.options.filter(o => o.trim())
            if (valid.length < 2) e.options = t('form.step1.error')
            else {
                // Client-side sanity check: must have at least 3 chars and contain some letters
                const crazy = valid.find(o => o.trim().length < 3 || !/[a-zA-Z\u0900-\u097F\u0600-\u06FF\u4E00-\u9FA5]/.test(o))
                if (crazy) e.options = `"${crazy.trim()}" ${t('form.step1.errorInvalid')}`
            }
        }
        if (step === 2) {
            if (!form.budget && form.budget !== 0) e.budget = t('form.step2.errorBudget')
            if (!form.timeMonths) e.timeMonths = t('form.step2.errorTime')
        }
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const next = () => { if (validate()) setStep(s => Math.min(s + 1, STEP_KEYS.length - 1)) }
    const back = () => setStep(s => Math.max(s - 1, 0))

    const handleSubmit = () => {
        if (!validate()) return
        const cleaned = { ...form, options: form.options.filter(o => o.trim()) }
        onSubmit(cleaned)
    }

    const getPrioritySuggestions = () => {
        const keys = PRIORITIES_KEYS[form.goal] || []
        return keys.map((key, idx) => t(`priorities.${form.goal}.${idx}`) || key)
    }
    
    const suggestions = getPrioritySuggestions()

    return (
        <div className="container" style={{ maxWidth: 680, padding: '40px 24px' }}>
            {/* Stepper */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 40 }}>
                {STEP_KEYS.map((key, i) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: i <= step ? 'linear-gradient(135deg,var(--accent),var(--accent2))' : 'var(--bg-card)',
                                border: i === step ? 'none' : '1px solid var(--border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.85rem', fontWeight: 700, color: i <= step ? '#fff' : 'var(--text-muted)',
                                boxShadow: i === step ? '0 0 16px var(--accent-glow)' : 'none',
                                transition: 'all 0.3s',
                            }}>
                                {i < step ? '✓' : i + 1}
                            </div>
                            <span style={{ fontSize: '0.72rem', marginTop: 6, color: i === step ? 'var(--accent)' : 'var(--text-muted)', fontWeight: i === step ? 600 : 400 }}>{t(`form.steps.${i}`)}</span>
                        </div>
                        {i < STEP_KEYS.length - 1 && (
                            <div style={{ height: 2, flex: 1, background: i < step ? 'var(--accent)' : 'var(--border)', marginBottom: 20, transition: 'background 0.3s' }} />
                        )}
                    </div>
                ))}
            </div>

            <div className="card p-8 animate-slide">
                {/* ── Step 0: Goal ────────────────────────────────── */}
                {step === 0 && (
                    <div>
                        <h2 style={{ marginBottom: 8 }}>{t('form.step0.title')}</h2>
                        <p style={{ marginBottom: 28 }}>{t('form.step0.subtitle')}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            {GOALS.map(g => (
                                <div
                                    key={g.id}
                                    role="radio"
                                    aria-checked={form.goal === g.id}
                                    tabIndex={0}
                                    onClick={() => { set('goal', g.id); setErrors({}) }}
                                    onKeyDown={e => e.key === 'Enter' && set('goal', g.id)}
                                    style={{
                                        padding: '20px 24px',
                                        border: `2px solid ${form.goal === g.id ? 'var(--accent)' : 'var(--border)'}`,
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer',
                                        background: form.goal === g.id ? 'var(--accent-glow)' : 'var(--bg-panel)',
                                        display: 'flex', alignItems: 'center', gap: 14,
                                        transition: 'all var(--transition)',
                                        boxShadow: form.goal === g.id ? 'var(--shadow-glow)' : 'none',
                                    }}
                                >
                                    <span style={{ fontSize: 28 }}>{g.icon}</span>
                                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{t(`categories.${g.id}.label`)}</span>
                                </div>
                            ))}
                        </div>
                        {errors.goal && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: 12 }}>⚠ {errors.goal}</p>}
                    </div>
                )}

                {/* ── Step 1: Options ─────────────────────────────── */}
                {step === 1 && (
                    <div>
                        <h2 style={{ marginBottom: 8 }}>
                            {form.goal === 'career' ? t('form.step1.titleCareer') :
                                form.goal === 'education' ? t('form.step1.titleEducation') :
                                    form.goal === 'finance' ? t('form.step1.titleFinance') :
                                        t('form.step1.titleLifestyle')}
                        </h2>
                        <p style={{ marginBottom: 28 }}>{t('form.step1.subtitle')}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {form.options.map((opt, i) => (
                                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-panel)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>{i + 1}</div>
                                    <input
                                        className="form-input"
                                        placeholder={`Option ${i + 1}, e.g. "${(OPTION_EXAMPLES[form.goal] || [])[i] || (OPTION_EXAMPLES[form.goal] || [])[0] || 'My Option'}"`}
                                        value={opt}
                                        onChange={e => setOption(i, e.target.value)}
                                    />
                                    {form.options.length > 2 && (
                                        <button className="btn btn-icon btn-ghost" onClick={() => removeOption(i)} title="Remove">✕</button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {form.options.length < 5 && (
                            <button className="btn btn-ghost btn-sm" style={{ marginTop: 14 }} onClick={addOption}>
                                {t('form.step1.addOption')}
                            </button>
                        )}
                        {errors.options && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: 12 }}>⚠ {errors.options}</p>}
                    </div>
                )}

                {/* ── Step 2: Constraints (Dynamic) ─────────────────── */}
                {step === 2 && (
                    <div>
                        <h2 style={{ marginBottom: 8 }}>
                            {form.goal === 'career' ? t('form.step2.titleCareer') :
                                form.goal === 'education' ? t('form.step2.titleEducation') :
                                    form.goal === 'finance' ? t('form.step2.titleFinance') :
                                        t('form.step2.titleLifestyle')}
                        </h2>
                        <p style={{ marginBottom: 28 }}>{t('form.step2.subtitle', { goal: t(`categories.${form.goal}.label`).toLowerCase() })}</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* CATEGORY SPECIFIC FIELDS */}
                            {form.goal === 'career' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">{t('form.step2.salary')}</label>
                                        <input className="form-input" type="number" placeholder={getPlaceholder('80000')} value={form.budget} onChange={e => set('budget', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('form.step2.experience')}</label>
                                        <input className="form-input" type="number" placeholder={t('form.step2.experiencePlaceholder')} value={form.context?.years_exp || ''} onChange={e => set('context', { ...form.context, years_exp: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('form.step2.relocate')}</label>
                                        <select className="form-select" value={form.context?.relocate || 'no'} onChange={e => set('context', { ...form.context, relocate: e.target.value })}>
                                            <option value="yes">{t('form.step2.relocateYes')}</option>
                                            <option value="no">{t('form.step2.relocateNo')}</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {form.goal === 'education' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">{t('form.step2.budget')}</label>
                                        <input className="form-input" type="number" placeholder={getPlaceholder('20000')} value={form.budget} onChange={e => set('budget', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('form.step2.educationLevel')}</label>
                                        <select className="form-select" value={form.context?.current_edu || 'high_school'} onChange={e => set('context', { ...form.context, current_edu: e.target.value })}>
                                            <option value="high_school">{t('form.step2.highSchool')}</option>
                                            <option value="bachelors">{t('form.step2.bachelors')}</option>
                                            <option value="masters">{t('form.step2.masters')}</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('form.step2.studyMode')}</label>
                                        <select className="form-select" value={form.context?.study_mode || 'on_campus'} onChange={e => set('context', { ...form.context, study_mode: e.target.value })}>
                                            <option value="on_campus">{t('form.step2.onCampus')}</option>
                                            <option value="online">{t('form.step2.online')}</option>
                                            <option value="hybrid">{t('form.step2.hybrid')}</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {form.goal === 'finance' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">{t('form.step2.investment')}</label>
                                        <input className="form-input" type="number" placeholder={getPlaceholder('10000')} value={form.budget} onChange={e => set('budget', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('form.step2.monthlyContribution')}</label>
                                        <input className="form-input" type="number" placeholder={getPlaceholder('500')} value={form.context?.monthly_contrib || ''} onChange={e => set('context', { ...form.context, monthly_contrib: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('form.step2.horizon')}</label>
                                        <input className="form-input" type="number" placeholder={t('form.step2.horizonPlaceholder')} value={form.context?.horizon_years || ''} onChange={e => set('context', { ...form.context, horizon_years: e.target.value })} />
                                    </div>
                                </>
                            )}

                            {form.goal === 'lifestyle' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">{t('form.step2.monthlyBudget')}</label>
                                        <input className="form-input" type="number" placeholder={getPlaceholder('200')} value={form.budget} onChange={e => set('budget', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('form.step2.frequency')}</label>
                                        <select className="form-select" value={form.context?.frequency || 'daily'} onChange={e => set('context', { ...form.context, frequency: e.target.value })}>
                                            <option value="daily">{t('form.step2.daily')}</option>
                                            <option value="weekly">{t('form.step2.weekly')}</option>
                                            <option value="monthly">{t('form.step2.monthly')}</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('form.step2.focus')}</label>
                                        <select className="form-select" value={form.context?.focus || 'wellbeing'} onChange={e => set('context', { ...form.context, focus: e.target.value })}>
                                            <option value="wellbeing">{t('form.step2.wellbeing')}</option>
                                            <option value="productivity">{t('form.step2.productivity')}</option>
                                            <option value="social">{t('form.step2.social')}</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* COMMON FIELDS */}
                            <div className="form-group">
                                <label className="form-label">{t('form.step2.riskTolerance')}</label>
                                <select className="form-select" value={form.riskTolerance} onChange={e => set('riskTolerance', e.target.value)}>
                                    <option value="low">{t('form.step2.riskLow')}</option>
                                    <option value="medium">{t('form.step2.riskMedium')}</option>
                                    <option value="high">{t('form.step2.riskHigh')}</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('form.step2.timeAvailable')}</label>
                                <input className="form-input" type="number" min="1" max="600" placeholder={t('form.step2.timePlaceholder')} value={form.timeMonths} onChange={e => set('timeMonths', e.target.value)} />
                                {errors.timeMonths && <p style={{ color: 'var(--danger)', fontSize: '0.82rem' }}>⚠ {errors.timeMonths}</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Step 3: Priorities ──────────────────────────── */}
                {step === 3 && (
                    <div>
                        <h2 style={{ marginBottom: 8 }}>{t('form.step3.title')}</h2>
                        <p style={{ marginBottom: 18 }}>{t('form.step3.subtitle')}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                            {suggestions.map((s, idx) => (
                                <button
                                    key={idx}
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => togglePriority(s)}
                                    style={{
                                        borderColor: form.priorities.includes(s) ? 'var(--accent)' : 'var(--border)',
                                        color: form.priorities.includes(s) ? 'var(--accent)' : 'var(--text-secondary)',
                                        background: form.priorities.includes(s) ? 'var(--accent-glow)' : 'transparent',
                                    }}
                                >
                                    {form.priorities.includes(s) ? '✓ ' : ''}{s}
                                </button>
                            ))}
                        </div>
                        {form.priorities.length > 0 && (
                            <div style={{ background: 'var(--bg-panel)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}>{t('form.step3.selected')}</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {form.priorities.map((p, idx) => (
                                        <span key={idx} className="badge badge-accent">✓ {p}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                    <button className="btn btn-ghost" onClick={back} disabled={step === 0}>{t('form.navigation.back')}</button>
                    {step < STEP_KEYS.length - 1
                        ? <button className="btn btn-primary" onClick={next}>{t('form.navigation.continue')}</button>
                        : <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                            {loading ? t('form.navigation.analyzing') : t('form.navigation.analyze')}
                        </button>
                    }
                </div>
            </div>
        </div>
    )
}

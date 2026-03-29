import React, { useState } from 'react'

const GOALS = [
    { id: 'career', icon: '💼', label: 'Career' },
    { id: 'education', icon: '🎓', label: 'Education' },
    { id: 'finance', icon: '💰', label: 'Finance' },
    { id: 'lifestyle', icon: '🌿', label: 'Lifestyle' },
]

const PRIORITIES_SUGGESTIONS = {
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

const STEPS = ['Goal', 'Options', 'Constraints', 'Priorities']

export default function DecisionForm({ onSubmit, loading }) {
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
        if (step === 0 && !form.goal) e.goal = 'Please select a goal category.'
        if (step === 1) {
            const valid = form.options.filter(o => o.trim())
            if (valid.length < 2) e.options = 'Enter at least 2 options.'
            else {
                // Client-side sanity check: must have at least 3 chars and contain some letters
                const crazy = valid.find(o => o.trim().length < 3 || !/[a-zA-Z]/.test(o))
                if (crazy) e.options = `"${crazy.trim()}" doesn't look like a valid option. Please enter something meaningful.`
            }
        }
        if (step === 2) {
            if (!form.budget && form.budget !== 0) e.budget = 'Budget is required.'
            if (!form.timeMonths) e.timeMonths = 'Time constraint is required.'
        }
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const next = () => { if (validate()) setStep(s => Math.min(s + 1, STEPS.length - 1)) }
    const back = () => setStep(s => Math.max(s - 1, 0))

    const handleSubmit = () => {
        if (!validate()) return
        const cleaned = { ...form, options: form.options.filter(o => o.trim()) }
        onSubmit(cleaned)
    }

    const suggestions = PRIORITIES_SUGGESTIONS[form.goal] || []

    return (
        <div className="container" style={{ maxWidth: 680, padding: '40px 24px' }}>
            {/* Stepper */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 40 }}>
                {STEPS.map((s, i) => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
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
                            <span style={{ fontSize: '0.72rem', marginTop: 6, color: i === step ? 'var(--accent)' : 'var(--text-muted)', fontWeight: i === step ? 600 : 400 }}>{s}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div style={{ height: 2, flex: 1, background: i < step ? 'var(--accent)' : 'var(--border)', marginBottom: 20, transition: 'background 0.3s' }} />
                        )}
                    </div>
                ))}
            </div>

            <div className="card p-8 animate-slide">
                {/* ── Step 0: Goal ────────────────────────────────── */}
                {step === 0 && (
                    <div>
                        <h2 style={{ marginBottom: 8 }}>What decision are you facing?</h2>
                        <p style={{ marginBottom: 28 }}>Choose the category that best describes your situation.</p>
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
                                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{g.label}</span>
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
                            {form.goal === 'career' ? 'What career paths are you considering?' :
                                form.goal === 'education' ? 'What educational programs are you comparing?' :
                                    form.goal === 'finance' ? 'What investment options are you evaluating?' :
                                        'What lifestyle changes are you planning?'}
                        </h2>
                        <p style={{ marginBottom: 28 }}>Enter 2–5 options you would like to compare.</p>
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
                                + Add Another Option
                            </button>
                        )}
                        {errors.options && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: 12 }}>⚠ {errors.options}</p>}
                    </div>
                )}

                {/* ── Step 2: Constraints (Dynamic) ─────────────────── */}
                {step === 2 && (
                    <div>
                        <h2 style={{ marginBottom: 8 }}>
                            {form.goal === 'career' ? 'Career Preferences' :
                                form.goal === 'education' ? 'Academic Background' :
                                    form.goal === 'finance' ? 'Financial Strategy' :
                                        'Lifestyle Details'}
                        </h2>
                        <p style={{ marginBottom: 28 }}>Tailoring the engine to your specific {form.goal} situation.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* CATEGORY SPECIFIC FIELDS */}
                            {form.goal === 'career' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">💰 Target Annual Salary</label>
                                        <input className="form-input" type="number" placeholder="e.g. 80000" value={form.budget} onChange={e => set('budget', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">📈 Years of Experience</label>
                                        <input className="form-input" type="number" placeholder="e.g. 5" value={form.context?.years_exp || ''} onChange={e => set('context', { ...form.context, years_exp: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">🌍 Willing to Relocate?</label>
                                        <select className="form-select" value={form.context?.relocate || 'no'} onChange={e => set('context', { ...form.context, relocate: e.target.value })}>
                                            <option value="yes">Yes, I am flexible</option>
                                            <option value="no">No, I prefer staying local</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {form.goal === 'education' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">💰 Maximum Tuition Budget</label>
                                        <input className="form-input" type="number" placeholder="e.g. 20000" value={form.budget} onChange={e => set('budget', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">🎓 Current Education Level</label>
                                        <select className="form-select" value={form.context?.current_edu || 'high_school'} onChange={e => set('context', { ...form.context, current_edu: e.target.value })}>
                                            <option value="high_school">High School</option>
                                            <option value="bachelors">Bachelor's Degree</option>
                                            <option value="masters">Master's Degree</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">💻 Preferred Study Mode</label>
                                        <select className="form-select" value={form.context?.study_mode || 'on_campus'} onChange={e => set('context', { ...form.context, study_mode: e.target.value })}>
                                            <option value="on_campus">On-Campus / Full Time</option>
                                            <option value="online">Online / Remote</option>
                                            <option value="hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {form.goal === 'finance' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">💰 Initial Investment Amount</label>
                                        <input className="form-input" type="number" placeholder="e.g. 10000" value={form.budget} onChange={e => set('budget', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">💵 Monthly Contribution</label>
                                        <input className="form-input" type="number" placeholder="e.g. 500" value={form.context?.monthly_contrib || ''} onChange={e => set('context', { ...form.context, monthly_contrib: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">📅 Investment Horizon (Years)</label>
                                        <input className="form-input" type="number" placeholder="e.g. 10" value={form.context?.horizon_years || ''} onChange={e => set('context', { ...form.context, horizon_years: e.target.value })} />
                                    </div>
                                </>
                            )}

                            {form.goal === 'lifestyle' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">💰 Monthly Budget for this change</label>
                                        <input className="form-input" type="number" placeholder="e.g. 200" value={form.budget} onChange={e => set('budget', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">🔄 Frequency of Activity</label>
                                        <select className="form-select" value={form.context?.frequency || 'daily'} onChange={e => set('context', { ...form.context, frequency: e.target.value })}>
                                            <option value="daily">Every Day</option>
                                            <option value="weekly">Few times a week</option>
                                            <option value="monthly">Occasionally</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">🎯 Primary Focus</label>
                                        <select className="form-select" value={form.context?.focus || 'wellbeing'} onChange={e => set('context', { ...form.context, focus: e.target.value })}>
                                            <option value="wellbeing">Overall Wellbeing</option>
                                            <option value="productivity">Productivity & Growth</option>
                                            <option value="social">Social Connection</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* COMMON FIELDS */}
                            <div className="form-group">
                                <label className="form-label">⚡ Risk Tolerance</label>
                                <select className="form-select" value={form.riskTolerance} onChange={e => set('riskTolerance', e.target.value)}>
                                    <option value="low">Low — I prefer stability and safety</option>
                                    <option value="medium">Medium — Balanced approach</option>
                                    <option value="high">High — I embrace uncertainty for bigger rewards</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">⏱ Time Available (months)</label>
                                <input className="form-input" type="number" min="1" max="600" placeholder="e.g. 12" value={form.timeMonths} onChange={e => set('timeMonths', e.target.value)} />
                                {errors.timeMonths && <p style={{ color: 'var(--danger)', fontSize: '0.82rem' }}>⚠ {errors.timeMonths}</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Step 3: Priorities ──────────────────────────── */}
                {step === 3 && (
                    <div>
                        <h2 style={{ marginBottom: 8 }}>Your Personal Priorities</h2>
                        <p style={{ marginBottom: 18 }}>Select up to 5 keywords that matter most to you.</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                            {suggestions.map(s => (
                                <button
                                    key={s}
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
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}>Selected priorities:</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {form.priorities.map(p => (
                                        <span key={p} className="badge badge-accent">✓ {p}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                    <button className="btn btn-ghost" onClick={back} disabled={step === 0}>← Back</button>
                    {step < STEPS.length - 1
                        ? <button className="btn btn-primary" onClick={next}>Continue →</button>
                        : <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                            {loading ? '⏳ Analysing...' : '🚀 Analyse My Decision'}
                        </button>
                    }
                </div>
            </div>
        </div>
    )
}

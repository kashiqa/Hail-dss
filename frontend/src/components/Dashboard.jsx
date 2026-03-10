import React from 'react'

const FEATURES = [
    { icon: '🎯', title: 'Structured Reasoning', desc: 'Rule-based engine evaluates every option across multiple weighted dimensions.' },
    { icon: '🔍', title: 'Explainable AI', desc: 'Every recommendation comes with a plain-English explanation — no black boxes.' },
    { icon: '🔐', title: 'Privacy-First', desc: 'All data stays in your browser. Nothing is sent to any external server.' },
    { icon: '📊', title: 'Rich Visualizations', desc: 'Charts, confidence levels and comparison tables make trade-offs crystal clear.' },
]

const CATEGORIES = [
    { id: 'career', icon: '💼', label: 'Career', desc: 'Job offers, role changes, freelancing' },
    { id: 'education', icon: '🎓', label: 'Education', desc: 'Degrees, courses, certifications' },
    { id: 'finance', icon: '💰', label: 'Finance', desc: 'Investments, savings, loans' },
    { id: 'lifestyle', icon: '🌿', label: 'Lifestyle', desc: 'Relocation, habits, health plans' },
]

export default function Dashboard({ onStart }) {
    return (
        <div className="relative animate-fade">
            {/* ── Hero ────────────────────────────────────────────── */}
            <section style={{ padding: '80px 24px 60px', textAlign: 'center', position: 'relative' }}>
                {/* Glow orbs */}
                <div style={{ position: 'absolute', top: 60, left: '20%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, var(--accent-glow), transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 120, right: '18%', width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, var(--accent2-glow), transparent 70%)', pointerEvents: 'none' }} />

                <div className="relative">
                    <span className="badge badge-accent" style={{ marginBottom: 20 }}>🧠 AI-Powered • Fully Private</span>
                    <h1 style={{ marginBottom: 20 }}>
                        Make Life Decisions<br />
                        <span style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            With Confidence
                        </span>
                    </h1>
                    <p style={{ maxWidth: 560, margin: '0 auto 40px', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                        HAIL-DSS analyses your options using a transparent, rule-based engine and ranks them with scores,
                        pros/cons, and clear explanations — all inside your browser.
                    </p>
                    <button className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '14px 36px' }} onClick={onStart}>
                        Start a Decision →
                    </button>
                </div>
            </section>

            {/* ── Category Cards ───────────────────────────────────── */}
            <section className="container" style={{ marginBottom: 64 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
                    {CATEGORIES.map(c => (
                        <div
                            key={c.id}
                            className="card"
                            style={{ padding: 24, cursor: 'pointer', textAlign: 'center' }}
                            onClick={onStart}
                            tabIndex={0}
                            role="button"
                            onKeyDown={e => e.key === 'Enter' && onStart()}
                        >
                            <div style={{ fontSize: 36, marginBottom: 10 }}>{c.icon}</div>
                            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.05rem', marginBottom: 6 }}>{c.label}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Feature Grid ─────────────────────────────────────── */}
            <section className="container" style={{ marginBottom: 80 }}>
                <h2 style={{ textAlign: 'center', marginBottom: 36 }}>How HAIL-DSS Works</h2>
                <div className="grid-2">
                    {FEATURES.map(f => (
                        <div key={f.title} className="glass" style={{ padding: 28, display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                            <span style={{ fontSize: 26, flexShrink: 0 }}>{f.icon}</span>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>{f.title}</div>
                                <p style={{ fontSize: '0.9rem', margin: 0 }}>{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

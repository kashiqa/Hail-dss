import React from 'react'
import DecisionChart from './DecisionChart'

const RANK_LABELS = ['🥇 Top Pick', '🥈 2nd Choice', '🥉 3rd Choice', '4th Option', '5th Option']
const RANK_COLORS = ['var(--accent)', 'var(--accent2)', 'var(--success)', 'var(--warning)', 'var(--text-muted)']

export default function ResultsPanel({ result, onReset }) {
    if (!result) return null
    const { goal, ranked_paths, summary } = result

    return (
        <div className="container animate-fade" style={{ padding: '40px 24px', maxWidth: 900 }}>

            {/* ── Summary Banner ────────────────────────────────────── */}
            <div className="glass" style={{ padding: '24px 28px', marginBottom: 32, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 32, flexShrink: 0 }}>💡</span>
                <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 6 }}>AI Recommendation Summary</div>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>{summary}</p>
                </div>
            </div>

            {/* ── Charts ───────────────────────────────────────────── */}
            <div style={{ marginBottom: 32 }}>
                <DecisionChart rankedPaths={ranked_paths} />
            </div>

            {/* ── Ranked Cards ─────────────────────────────────────── */}
            <h2 style={{ marginBottom: 20 }}>Ranked Recommendations</h2>
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
                                    {RANK_LABELS[i] || `#${i + 1}`}
                                </span>
                                <h3 style={{ margin: 0 }}>{p.option}</h3>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.8rem', fontWeight: 800, color: RANK_COLORS[i] }}>
                                    {p.score_pct}%
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Overall Score</div>
                            </div>
                        </div>

                        {/* Score bar */}
                        <div className="score-bar-track" style={{ marginBottom: 8 }}>
                            <div className="score-bar-fill" style={{ width: `${p.score_pct}%` }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                            <span className="text-xs text-muted">Score</span>
                            <span className="text-xs" style={{ color: 'var(--accent2)' }}>Confidence: {p.confidence_pct}%</span>
                        </div>

                        {/* Dimension Scores */}
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>Dimension Breakdown</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10 }}>
                                {Object.entries(p.dimension_scores).map(([dim, val]) => (
                                    <div key={dim} style={{ background: 'var(--bg-panel)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                                            {dim.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </div>
                                        <div className="score-bar-track" style={{ height: 5, marginBottom: 4 }}>
                                            <div className="score-bar-fill" style={{ width: `${val}%`, background: val >= 70 ? 'var(--success)' : val >= 45 ? 'var(--warning)' : 'var(--danger)' }} />
                                        </div>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: val >= 70 ? 'var(--success)' : val >= 45 ? 'var(--warning)' : 'var(--danger)' }}>{val}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pros & Cons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                            <div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--success)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>✅ Pros</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {p.pros.length ? p.pros.map((pro, j) => <span key={j} className="pill pro">✓ {pro}</span>) : <span className="text-muted text-sm">None identified</span>}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--danger)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>⚠ Cons</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {p.cons.length ? p.cons.map((con, j) => <span key={j} className="pill con">! {con}</span>) : <span className="text-muted text-sm">None identified</span>}
                                </div>
                            </div>
                        </div>

                        {/* Explanation */}
                        <div style={{ background: 'var(--bg-panel)', borderRadius: 'var(--radius-md)', padding: '14px 16px', borderLeft: '3px solid var(--accent)' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>🧠 AI Explanation</div>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>{p.explanation}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Actions ──────────────────────────────────────────── */}
            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 14 }}>
                <button className="btn btn-ghost" onClick={onReset}>← Start New Decision</button>
            </div>
        </div>
    )
}

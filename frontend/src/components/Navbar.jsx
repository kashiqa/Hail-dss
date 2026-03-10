import React from 'react'

export default function Navbar({ onHistoryToggle, historyOpen }) {
    return (
        <nav style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: 'hsla(228,25%,10%,0.85)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border)',
            padding: '0 24px',
        }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, boxShadow: '0 0 20px var(--accent-glow)',
                    }}>🧠</div>
                    <div>
                        <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: 1 }}>
                            HAIL-DSS
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                            DECISION INTELLIGENCE SYSTEM
                        </div>
                    </div>
                </div>

                {/* Right Actions */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'hsla(150,70%,50%,0.1)', border: '1px solid hsla(150,70%,50%,0.25)',
                        borderRadius: '999px', padding: '4px 12px',
                        fontSize: '0.78rem', color: 'var(--success)',
                    }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                        Privacy-First
                    </div>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={onHistoryToggle}
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        📋 {historyOpen ? 'Close' : 'History'}
                    </button>
                </div>
            </div>
        </nav>
    )
}

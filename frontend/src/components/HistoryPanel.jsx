import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { deleteDecision, clearHistory } from '../utils/storage'

export default function HistoryPanel({ history, onClose, onRefresh }) {
    const { t } = useLanguage()
    
    const handleDelete = id => {
        deleteDecision(id)
        onRefresh()
    }
    const handleClear = () => {
        clearHistory()
        onRefresh()
    }

    return (
        <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 200,
            width: '100%', maxWidth: 420,
            background: 'var(--bg-base)',
            borderLeft: '1px solid var(--border)',
            backdropFilter: 'blur(20px)',
            overflowY: 'auto',
            boxShadow: '-8px 0 40px rgba(0,0,0,0.4)',
            animation: 'slideUp 0.3s ease',
        }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-base)', zIndex: 10 }}>
                <div>
                    <h3 style={{ margin: 0, fontFamily: 'var(--font-head)' }}>{t('history.title')}</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem' }}>{t('history.count', { count: history.length })}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {history.length > 0 && (
                        <button className="btn btn-danger btn-sm" onClick={handleClear} title="Clear all">{t('history.clearAll')}</button>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
                </div>
            </div>

            {/* Privacy notice */}
            <div style={{ margin: '16px 20px', background: 'hsla(150,70%,50%,0.08)', border: '1px solid hsla(150,70%,50%,0.2)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '0.8rem', color: 'var(--success)' }}>
                {t('history.privacy')}
            </div>

            {/* History list */}
            {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>{t('history.empty.icon')}</div>
                    <p>{t('history.empty.text')}</p>
                </div>
            ) : (
                <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {history.map(h => (
                        <div key={h.id} className="card" style={{ padding: '16px 18px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                <div>
                                    <span className="badge badge-accent" style={{ marginBottom: 6, textTransform: 'capitalize' }}>{h.goal}</span>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                                        {h.ranked_paths?.[0]?.option || 'Decision'}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                        {new Date(h.timestamp).toLocaleDateString()} · {h.ranked_paths?.length || 0} options ranked
                                    </div>
                                </div>
                                <button className="btn btn-icon btn-ghost" onClick={() => handleDelete(h.id)} title="Delete" style={{ color: 'var(--danger)', borderColor: 'transparent' }}>🗑</button>
                            </div>
                            {h.ranked_paths?.[0] && (
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                                    {h.ranked_paths.slice(0, 3).map(p => (
                                        <span key={p.option} style={{ fontSize: '0.78rem', background: 'var(--bg-panel)', borderRadius: 'var(--radius-sm)', padding: '3px 8px', color: 'var(--text-secondary)' }}>
                                            #{p.rank} {p.option.slice(0, 20)} · {p.score_pct}%
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

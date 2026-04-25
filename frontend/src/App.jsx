import React, { useState, useCallback } from 'react'
import { useLanguage } from './contexts/LanguageContext'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import DecisionForm from './components/DecisionForm'
import ResultsPanel from './components/ResultsPanel'
import HistoryPanel from './components/HistoryPanel'
import { getDecision } from './services/decisionService'
import { saveDecision, loadHistory } from './utils/storage'

const VIEWS = { DASHBOARD: 'dashboard', FORM: 'form', RESULTS: 'results' }

export default function App() {
    const { t, isRTL } = useLanguage()
    const [view, setView] = useState(VIEWS.DASHBOARD)
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [historyOpen, setHistoryOpen] = useState(false)
    const [history, setHistory] = useState(loadHistory)

    const refreshHistory = useCallback(() => setHistory(loadHistory()), [])

    const handleStart = () => {
        setError(null)
        setResult(null)
        setView(VIEWS.FORM)
    }

    const handleSubmit = async formData => {
        setLoading(true)
        setError(null)
        try {
            const data = await getDecision(formData)
            // Save to local storage
            const record = saveDecision({
                goal: formData.goal,
                ranked_paths: data.ranked_paths,
                summary: data.summary,
            })
            refreshHistory()
            setResult(data)
            setView(VIEWS.RESULTS)
        } catch (err) {
            const detail = err?.response?.data?.detail || err.message || t('errors.generic')
            // 400 = invalid input from AI validation
            const isInvalid = err?.response?.status === 400
            setError({ message: detail, isInvalid })
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setView(VIEWS.DASHBOARD)
        setResult(null)
        setError(null)
    }

    return (
        <div style={{ minHeight: '100vh', position: 'relative', direction: isRTL ? 'rtl' : 'ltr' }}>
            <Navbar onHistoryToggle={() => setHistoryOpen(o => !o)} historyOpen={historyOpen} />

            {/* Error toast */}
            {error && (
                <div style={{
                    position: 'fixed', top: 76, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 300, background: 'var(--bg-card)',
                    border: `1px solid ${error.isInvalid ? 'var(--warning)' : 'var(--danger)'}`,
                    borderRadius: 'var(--radius-md)', padding: '14px 22px', maxWidth: 560,
                    color: error.isInvalid ? 'var(--warning)' : 'var(--danger)',
                    fontSize: '0.9rem', boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{error.isInvalid ? '🚫' : '⚠️'}</span>
                    <div>
                        {error.isInvalid && (
                            <div style={{ fontWeight: 700, marginBottom: 4 }}>{t('errors.invalidInput')}</div>
                        )}
                        <span>{error.message}</span>
                    </div>
                    <button style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 18, padding: 2, flexShrink: 0 }} onClick={() => setError(null)}>✕</button>
                </div>
            )}

            {/* Main Content */}
            <main style={{ position: 'relative', zIndex: 1, minHeight: 'calc(100vh - 64px)' }}>
                {view === VIEWS.DASHBOARD && <Dashboard onStart={handleStart} />}

                {view === VIEWS.FORM && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <DecisionForm onSubmit={handleSubmit} loading={loading} />
                    </div>
                )}

                {view === VIEWS.RESULTS && result && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <ResultsPanel result={result} onReset={handleReset} />
                    </div>
                )}

                {/* Loading overlay */}
                {loading && (
                    <div style={{
                        position: 'fixed', inset: 0, zIndex: 250,
                        background: 'rgba(7,8,20,0.75)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 20,
                        backdropFilter: 'blur(6px)',
                    }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
                        <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                            {t('loading.title')}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {t('loading.subtitle')}
                        </div>
                    </div>
                )}
            </main>

            {/* History Panel */}
            {historyOpen && (
                <>
                    <div
                        style={{ position: 'fixed', inset: 0, zIndex: 190, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}
                        onClick={() => setHistoryOpen(false)}
                    />
                    <HistoryPanel
                        history={history}
                        onClose={() => setHistoryOpen(false)}
                        onRefresh={refreshHistory}
                    />
                </>
            )}

            {/* Footer */}
            {view === VIEWS.DASHBOARD && (
                <footer style={{ borderTop: '1px solid var(--border)', padding: '20px 24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <p style={{ fontSize: '0.82rem', margin: 0 }}>
                        {t('app.footer')} ·{' '}
                        <span style={{ color: 'var(--success)' }}>{t('app.privacy')}</span>
                    </p>
                </footer>
            )}
        </div>
    )
}

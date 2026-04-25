import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend,
} from 'recharts'

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

export default function DecisionChart({ rankedPaths }) {
    const { t } = useLanguage()
    if (!rankedPaths || rankedPaths.length === 0) return null

    // Bar chart data
    const barData = rankedPaths.map(p => ({
        name: p.option.length > 18 ? p.option.slice(0, 16) + '…' : p.option,
        Score: p.score_pct,
        Confidence: p.confidence_pct,
    }))

    // Radar chart data — use first 2 options for readability
    const top2 = rankedPaths.slice(0, 2)
    const dims = Object.keys(top2[0]?.dimension_scores || {})
    const radarData = dims.map(d => {
        const dimKey = DIMENSION_KEYS[d] || d
        const translatedDim = t(dimKey, {}) || d.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        const row = { dimension: translatedDim }
        top2.forEach(p => { row[p.option.slice(0, 20)] = p.dimension_scores[d] })
        return row
    })

    const COLORS = ['#38bdf8', '#a78bfa', '#4ade80', '#fb923c', '#f472b6']

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null
        return (
            <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 16px', fontSize: '0.85rem' }}>
                <p style={{ fontWeight: 700, marginBottom: 6 }}>{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color }}>{p.name}: {p.value}%</p>
                ))}
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* ── Scores Bar Chart ─────────────────────────────────── */}
            <div className="card p-6">
                <h3 style={{ marginBottom: 20 }}>📊 {t('charts.scoreComparison')}</h3>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barData} margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" />
                        <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(56,189,248,0.05)' }} />
                        <Bar dataKey="Score" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="Confidence" fill="#a78bfa" radius={[6, 6, 0, 0]} />
                        <Legend iconType="circle" wrapperStyle={{ color: 'var(--text-secondary)', fontSize: 12 }} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* ── Radar (Dimension) Chart ───────────────────────────── */}
            {radarData.length > 0 && top2.length >= 2 && (
                <div className="card p-6">
                    <h3 style={{ marginBottom: 4 }}>🕸 {t('charts.dimensionAnalysis')}</h3>
                    <p style={{ fontSize: '0.84rem', marginBottom: 20 }}>{t('charts.top2Comparison')}</p>
                    <ResponsiveContainer width="100%" height={280}>
                        <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                            <PolarGrid stroke="var(--border)" />
                            <PolarAngleAxis dataKey="dimension" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                            {top2.map((p, i) => (
                                <Radar key={p.option} name={p.option.slice(0, 20)} dataKey={p.option.slice(0, 20)} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.18} strokeWidth={2} />
                            ))}
                            <Legend iconType="circle" wrapperStyle={{ color: 'var(--text-secondary)', fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    )
}

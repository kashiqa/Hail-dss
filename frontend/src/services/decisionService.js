import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

/**
 * Send decision request to the HAIL-DSS backend.
 * @returns {Promise<{goal, ranked_paths, summary}>}
 */
export async function getDecision({ goal, options, budget, riskTolerance, timeMonths, priorities, context }) {
    const { data } = await api.post('/decide', {
        goal,
        options,
        budget: Number(budget),
        risk_tolerance: riskTolerance,
        time_months: Number(timeMonths),
        priorities,
        context: context || {},
    })
    return data
}

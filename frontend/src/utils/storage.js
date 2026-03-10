/**
 * HAIL-DSS Local Storage Utility
 * Stores decision history in localStorage with simple base64 encoding.
 * All data stays in the browser — no external servers.
 */

const STORAGE_KEY = 'haildss_history'

function encode(data) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))))
}

function decode(str) {
    try {
        return JSON.parse(decodeURIComponent(escape(atob(str))))
    } catch {
        return []
    }
}

export function loadHistory() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return decode(raw)
}

export function saveDecision(entry) {
    const history = loadHistory()
    const record = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...entry,
    }
    history.unshift(record) // newest first
    localStorage.setItem(STORAGE_KEY, encode(history.slice(0, 50))) // cap at 50
    return record
}

export function deleteDecision(id) {
    const history = loadHistory().filter(h => h.id !== id)
    localStorage.setItem(STORAGE_KEY, encode(history))
}

export function clearHistory() {
    localStorage.removeItem(STORAGE_KEY)
}

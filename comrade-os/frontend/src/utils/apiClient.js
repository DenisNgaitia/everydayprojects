/**
 * apiClient.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Thin fetch wrapper for authenticated API calls.
 *
 * - Reads JWT from localStorage
 * - Attaches Authorization header
 * - Auto-parses JSON
 * - On 401 → clears token + redirects to /login
 * ─────────────────────────────────────────────────────────────────────────────
 */

const TOKEN_KEY = 'comradeos_token';

/**
 * Returns the base URL for API calls.
 * In dev, Vite proxy rewrites /api → http://localhost:5000/api
 * so we just use '' (relative paths).
 * In production, set VITE_API_URL to the deployed backend URL.
 */
function getBaseUrl() {
    return import.meta.env.VITE_API_URL || '';
}

/**
 * getToken() — read JWT from localStorage
 */
export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * setToken(token) — persist JWT
 */
export function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

/**
 * clearToken() — remove JWT
 */
export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

/**
 * apiClient(endpoint, options) → Promise<data>
 *
 * @param {string} endpoint  - e.g. '/api/auth/login'
 * @param {object} options   - fetch options (method, body, headers, etc.)
 * @returns {Promise<any>}   - parsed JSON response
 * @throws {{ status, error }} on non-2xx responses
 */
export async function apiClient(endpoint, options = {}) {
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${getBaseUrl()}${endpoint}`, {
        ...options,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    // Parse response
    let data;
    try {
        data = await res.json();
    } catch {
        data = { error: 'Unexpected server response.' };
    }

    // Handle auth failures — auto-logout
    if (res.status === 401) {
        clearToken();
        // Only redirect if we're not already on the login page
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
        throw { status: 401, error: data.error || 'Session expired. Please log in again.' };
    }

    if (!res.ok) {
        throw { status: res.status, error: data.error || `Request failed with status ${res.status}` };
    }

    return data;
}

// ─── Convenience Methods ──────────────────────────────────────────────────────

export const api = {
    get:    (url)       => apiClient(url, { method: 'GET' }),
    post:   (url, body) => apiClient(url, { method: 'POST', body }),
    put:    (url, body) => apiClient(url, { method: 'PUT', body }),
    patch:  (url, body) => apiClient(url, { method: 'PATCH', body }),
    delete: (url)       => apiClient(url, { method: 'DELETE' }),
};

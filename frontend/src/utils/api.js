/**
 * API client — all calls go through here.
 *
 * In production the Node server serves both the API and the frontend on the
 * same origin, so we use relative paths (BASE_URL = '').
 * In development Vite proxies /api and /auth to http://localhost:4000.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

function getToken() {
  return localStorage.getItem('mealytics_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// ── Auth ──────────────────────────────────────────────────
export const api = {
  auth: {
    register: (email, password, name) =>
      request('/auth/register', { method: 'POST', body: { email, password, name } }),
    login: (email, password) =>
      request('/auth/login', { method: 'POST', body: { email, password } }),
    me: () => request('/auth/me'),
  },

  // ── Profile ──────────────────────────────────────────────
  profile: {
    update: (data) => request('/api/profile', { method: 'PUT', body: data }),
  },

  // ── Journal ──────────────────────────────────────────────
  journal: {
    get: (date) => request(`/api/journal?date=${date}`),
    summary: (year, month) => request(`/api/journal/summary?year=${year}&month=${month}`),
    add: (entry) => request('/api/journal', { method: 'POST', body: entry }),
    remove: (id) => request(`/api/journal/${id}`, { method: 'DELETE' }),
  },

  // ── Weight ───────────────────────────────────────────────
  weight: {
    getAll: () => request('/api/weight'),
    add: (date, weight, note) => request('/api/weight', { method: 'POST', body: { date, weight, note } }),
    remove: (id) => request(`/api/weight/${id}`, { method: 'DELETE' }),
  },

  // ── Recipes ──────────────────────────────────────────────
  recipes: {
    getAll: () => request('/api/recipes'),
    create: (name, ingredients) => request('/api/recipes', { method: 'POST', body: { name, ingredients } }),
    update: (id, data) => request(`/api/recipes/${id}`, { method: 'PUT', body: data }),
    remove: (id) => request(`/api/recipes/${id}`, { method: 'DELETE' }),
  },

  // ── Favorites ────────────────────────────────────────────
  favorites: {
    getAll: () => request('/api/favorites'),
    toggle: (foodId) => request('/api/favorites/toggle', { method: 'POST', body: { foodId } }),
  },

  // ── Recents ──────────────────────────────────────────────
  recents: {
    getAll: () => request('/api/recents'),
  },

  // ── Water ────────────────────────────────────────────────
  water: {
    get: (date) => request(`/api/water?date=${date}`),
    update: (date, delta) => request('/api/water', { method: 'POST', body: { date, delta } }),
  },
};

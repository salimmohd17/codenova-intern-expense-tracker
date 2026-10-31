// Normalize URL: works whether VITE_API_URL includes /api or not
const _raw = (import.meta.env.VITE_API_URL || 'http://localhost:5002/api').replace(/\/$/, '');
const API_BASE = _raw.endsWith('/api') ? _raw : _raw + '/api';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
  } catch {
    throw new Error('Could not connect to the server. Check that the API is running.');
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || `Request failed (${response.status})`);
  }
  return payload;
}

export const api = {
  getTransactions: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.type && params.type !== 'all') query.set('type', params.type);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return request(`/transactions${suffix}`);
  },
  getSummary: () => request('/transactions/summary'),
  createTransaction: (transaction) =>
    request('/transactions', { method: 'POST', body: JSON.stringify(transaction) }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: 'DELETE' })
};

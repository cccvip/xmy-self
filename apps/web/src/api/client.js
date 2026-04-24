const API_BASE = '';

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  getRecords: (type) => request(`/api/records${type ? `?type=${type}` : ''}`),
  getRecord: (id) => request(`/api/records/${id}`),
  createRecord: (data) => request('/api/records', { method: 'POST', body: JSON.stringify(data) }),
  updateRecord: (id, data) => request(`/api/records/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRecord: (id) => request(`/api/records/${id}`, { method: 'DELETE' }),
  uploadPhoto: (file) => {
    const form = new FormData();
    form.append('photo', file);
    return fetch('/api/upload/photo', { method: 'POST', body: form }).then(r => r.json());
  },
};

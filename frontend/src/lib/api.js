const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function apiFetch(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('wwm_token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || res.statusText || 'Request failed');
  }
  return data;
}

export const api = {
  packages: {
    list: (params) => {
      const q = new URLSearchParams(params).toString();
      return apiFetch(`/packages${q ? '?' + q : ''}`);
    },
    featured: () => apiFetch('/packages/featured'),
    vendorMe: () => apiFetch('/packages/vendor/me'),
    get: (idOrSlug) => apiFetch(`/packages/${idOrSlug}`),
    create: (body) => apiFetch('/packages', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => apiFetch(`/packages/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (id) => apiFetch(`/packages/${id}`, { method: 'DELETE' }),
  },
  auth: {
    register: (body) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    me: () => apiFetch('/auth/me'),
    update: (body) => apiFetch('/auth/me', { method: 'PATCH', body: JSON.stringify(body) }),
  },
  bookings: {
    create: (body) => apiFetch('/bookings', { method: 'POST', body: JSON.stringify(body) }),
    my: () => apiFetch('/bookings/my'),
    vendor: () => apiFetch('/bookings/vendor'),
    get: (id) => apiFetch(`/bookings/${id}`),
    initiatePayment: (id) => apiFetch(`/bookings/${id}/initiate-payment`, { method: 'POST' }),
    accept: (id) => apiFetch(`/bookings/${id}/accept`, { method: 'POST' }),
    complete: (id) => apiFetch(`/bookings/${id}/complete`, { method: 'POST' }),
    cancel: (id, reason) => apiFetch(`/bookings/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),
  },
  payments: {
    verify: (reference) => apiFetch(`/payments/verify?reference=${encodeURIComponent(reference)}`),
  },
  vendors: {
    apply: (body) => apiFetch('/vendors/apply', { method: 'POST', body: JSON.stringify(body) }),
    me: () => apiFetch('/vendors/me'),
    update: (body) => apiFetch('/vendors/me', { method: 'PATCH', body: JSON.stringify(body) }),
  },
  ratings: {
    add: (body) => apiFetch('/ratings', { method: 'POST', body: JSON.stringify(body) }),
    vendor: (vendorId) => apiFetch(`/ratings/vendor/${vendorId}`),
  },
  disputes: {
    create: (body) => apiFetch('/disputes', { method: 'POST', body: JSON.stringify(body) }),
    list: () => apiFetch('/disputes'),
    resolve: (id, notes) => apiFetch(`/disputes/${id}/resolve`, { method: 'POST', body: JSON.stringify({ resolution_notes: notes }) }),
  },
  config: {
    get: () => apiFetch('/config'),
    update: (key, value) => apiFetch('/config', { method: 'PATCH', body: JSON.stringify({ key, value }) }),
  },
  admin: {
    dashboard: () => apiFetch('/admin/dashboard'),
    vendors: (status) => apiFetch(`/admin/vendors${status ? '?status=' + status : ''}`),
    approveVendor: (id) => apiFetch(`/admin/vendors/${id}/approve`, { method: 'POST' }),
    rejectVendor: (id, reason) =>
      apiFetch(`/admin/vendors/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    bookings: () => apiFetch('/admin/bookings'),
    payments: () => apiFetch('/admin/payments'),
    releasePayment: (id) => apiFetch(`/admin/payments/${id}/release`, { method: 'POST' }),
    packages: () => apiFetch('/admin/packages'),
    analytics: (from, to) => apiFetch(`/admin/analytics${from ? '?from=' + from + (to ? '&to=' + to : '') : ''}`),
  },
};

const BASE_URL = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'scoopzy_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

/** Image paths from the backend are relative ("/images/..", "/uploads/.."); point them at the API host. */
export const assetUrl = (url) => (url && url.startsWith('/') ? `${BASE_URL}${url}` : url);

async function request(path, { method = 'GET', body } = {}) {
  const isForm = body instanceof FormData;
  const headers = isForm ? {} : { 'Content-Type': 'application/json' };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}/api${path}`, {
      method,
      headers,
      body: isForm ? body : body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401) tokenStore.clear();
    const message = data?.message || (res.status === 401 ? 'Please log in again' : `Request failed (${res.status})`);
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  // auth
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  me: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/me', { method: 'PUT', body }),

  // catalog
  suppliers: ({ q = '', city = '', sort = '' } = {}) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (city) params.set('city', city);
    if (sort) params.set('sort', sort);
    const qs = params.toString();
    return request(`/suppliers${qs ? `?${qs}` : ''}`);
  },
  supplier: (id) => request(`/suppliers/${id}`),
  cities: () => request('/cities'),

  // orders
  placeOrder: (body) => request('/orders', { method: 'POST', body }),
  myOrders: () => request('/orders'),
  order: (id) => request(`/orders/${id}`),
  cancelOrder: (id) => request(`/orders/${id}/cancel`, { method: 'PATCH' }),

  // admin
  admin: {
    orders: () => request('/admin/orders'),
    updateOrderStatus: (id, status) => request(`/admin/orders/${id}/status`, { method: 'PATCH', body: { status } }),
    createSupplier: (body) => request('/admin/suppliers', { method: 'POST', body }),
    updateSupplier: (id, body) => request(`/admin/suppliers/${id}`, { method: 'PUT', body }),
    deleteSupplier: (id) => request(`/admin/suppliers/${id}`, { method: 'DELETE' }),
    addIceCream: (supplierId, body) => request(`/admin/suppliers/${supplierId}/ice-creams`, { method: 'POST', body }),
    updateIceCream: (id, body) => request(`/admin/ice-creams/${id}`, { method: 'PUT', body }),
    deleteIceCream: (id) => request(`/admin/ice-creams/${id}`, { method: 'DELETE' }),
    uploadImage: (file) => {
      const form = new FormData();
      form.append('file', file);
      return request('/admin/uploads', { method: 'POST', body: form });
    },
  },
};

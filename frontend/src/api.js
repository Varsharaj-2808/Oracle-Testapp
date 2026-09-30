// The frontend holds no credentials. Every request goes to the backend, which
// is the only process that reads SUPABASE_* and BREVO_* from the environment.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!response.ok) {
    const message = data?.error || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.missing = data?.missing;
    throw error;
  }

  return data;
}

export const api = {
  getConfig: () => request('/api/config'),
  getCustomers: () => request('/api/customers'),
  createCustomer: (customer) => request('/api/customers', { method: 'POST', body: customer }),
  getProducts: () => request('/api/products'),
  getOrders: () => request('/api/orders'),
  createOrder: (order) => request('/api/orders', { method: 'POST', body: order }),
  sendTestEmail: (payload) => request('/api/email/test', { method: 'POST', body: payload }),
};

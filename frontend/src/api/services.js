/**
 * Typed API service functions for every backend resource.
 * All functions return the response data directly.
 */
import api from './client'

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),

  register: (data) =>
    api.post('/auth/register', data).then((r) => r.data),

  me: () =>
    api.get('/auth/me').then((r) => r.data),
}

// ── Products ──────────────────────────────────────────────────────────────────
export const productsApi = {
  list: (params = {}) =>
    api.get('/products', { params }).then((r) => r.data),

  get: (id) =>
    api.get(`/products/${id}`).then((r) => r.data),

  create: (data) =>
    api.post('/products', data).then((r) => r.data),

  update: (id, data) =>
    api.patch(`/products/${id}`, data).then((r) => r.data),

  delete: (id) =>
    api.delete(`/products/${id}`).then((r) => r.data),

  adjustStock: (id, adjustment, reason = '') =>
    api.post(`/products/${id}/adjust-stock`, { adjustment, reason }).then((r) => r.data),

  lowStock: () =>
    api.get('/products/alerts/low-stock').then((r) => r.data),

  dashboardStats: () =>
    api.get('/products/stats/dashboard').then((r) => r.data),
}

// ── Categories ────────────────────────────────────────────────────────────────
export const categoriesApi = {
  list: (params = {}) =>
    api.get('/categories', { params }).then((r) => r.data),

  create: (data) =>
    api.post('/categories', data).then((r) => r.data),

  update: (id, data) =>
    api.patch(`/categories/${id}`, data).then((r) => r.data),

  delete: (id) =>
    api.delete(`/categories/${id}`).then((r) => r.data),
}

// ── Suppliers ─────────────────────────────────────────────────────────────────
export const suppliersApi = {
  list: (params = {}) =>
    api.get('/suppliers', { params }).then((r) => r.data),

  create: (data) =>
    api.post('/suppliers', data).then((r) => r.data),

  update: (id, data) =>
    api.patch(`/suppliers/${id}`, data).then((r) => r.data),

  delete: (id) =>
    api.delete(`/suppliers/${id}`).then((r) => r.data),
}

// ── Sales ─────────────────────────────────────────────────────────────────────
export const salesApi = {
  list: (params = {}) =>
    api.get('/sales', { params }).then((r) => r.data),

  create: (data) =>
    api.post('/sales', data).then((r) => r.data),

  uploadCsv: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/sales/upload-csv', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  summary: (params = {}) =>
    api.get('/sales/summary', { params }).then((r) => r.data),
}

// ── Forecasts ─────────────────────────────────────────────────────────────────
export const forecastsApi = {
  getProducts: () =>
    api.get('/products', { params: { page_size: 500 } }).then(r =>
      Array.isArray(r.data) ? r.data : r.data.items ?? []
    ),

  generate: (productId, horizonDays) =>
    api.post('/forecasts/generate', { product_id: productId, horizon_days: horizonDays }).then(r => r.data),
}

// ── Inventory ─────────────────────────────────────────────────────────────────
export const inventoryApi = {
  getDataset: () =>
    api.get('/products', { params: { page_size: 500 } }).then(r =>
      Array.isArray(r.data) ? r.data : r.data.items ?? []
    ),

  getProductSales: (productId) =>
    api.get(`/sales-history/${productId}`).then(r => r.data),
}
 
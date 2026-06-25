const BASE_URL = '/api'

async function request(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  }
  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body)
  }
  try {
    const resp = await fetch(fullUrl, config)
    const data = await resp.json()
    return data
  } catch (e) {
    return { code: -1, message: '网络请求失败，请检查后端服务是否启动', data: null }
  }
}

export const providerApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/providers${qs ? '?' + qs : ''}`)
  },
  get: (id) => request(`/providers/${id}`),
  create: (data) => request('/providers', { method: 'POST', body: data }),
  update: (id, data) => request(`/providers/${id}`, { method: 'PUT', body: data }),
  options: () => request('/providers/meta/options'),
}

export const authApi = {
  get: (providerId) => request(`/realname-auth/${providerId}`),
  submit: (providerId, data) => request(`/realname-auth/${providerId}/submit`, { method: 'POST', body: data }),
  approve: (providerId) => request(`/realname-auth/${providerId}/approve`, { method: 'POST' }),
  reject: (providerId, reason) => request(`/realname-auth/${providerId}/reject`, { method: 'POST', body: { reason } }),
}

export const demandApi = {
  list: () => request('/demands'),
  get: (id) => request(`/demands/${id}`),
  create: (data) => request('/demands', { method: 'POST', body: data }),
  match: (id, limit = 5) => request(`/demands/${id}/match?limit=${limit}`),
}

export const orderApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/orders${qs ? '?' + qs : ''}`)
  },
  get: (id) => request(`/orders/${id}`),
  create: (data) => request('/orders', { method: 'POST', body: data }),
  accept: (id) => request(`/orders/${id}/accept`, { method: 'POST' }),
  start: (id) => request(`/orders/${id}/start`, { method: 'POST' }),
  complete: (id) => request(`/orders/${id}/complete`, { method: 'POST' }),
  cancel: (id, cancelReason) => request(`/orders/${id}/cancel`, { method: 'POST', body: { cancel_reason: cancelReason } }),
}

export const adminApi = {
  stats: () => request('/admin/stats'),
  providers: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/admin/providers${qs ? '?' + qs : ''}`)
  },
  orders: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/admin/orders${qs ? '?' + qs : ''}`)
  },
}

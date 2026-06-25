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

export const contractApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/contracts${qs ? '?' + qs : ''}`)
  },
  get: (id) => request(`/contracts/${id}`),
  getByOrder: (orderId) => request(`/contracts/by-order/${orderId}`),
  update: (id, data) => request(`/contracts/${id}`, { method: 'PUT', body: data }),
  sign: (id) => request(`/contracts/${id}/sign`, { method: 'POST' }),
  reject: (id, reason) => request(`/contracts/${id}/reject`, { method: 'POST', body: { reason } }),
  void: (id, reason) => request(`/contracts/${id}/void`, { method: 'POST', body: { reason } }),
}

export const paymentApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/payments${qs ? '?' + qs : ''}`)
  },
  get: (id) => request(`/payments/${id}`),
  getByOrder: (orderId) => request(`/payments/by-order/${orderId}`),
  escrow: (orderId, amount) => request(`/payments/${orderId}/escrow`, { method: 'POST', body: { amount } }),
  confirmComplete: (orderId) => request(`/payments/${orderId}/confirm-complete`, { method: 'POST' }),
  applyRefund: (orderId, reason) => request(`/payments/${orderId}/apply-refund`, { method: 'POST', body: { reason } }),
  settle: (orderId) => request(`/payments/${orderId}/settle`, { method: 'POST' }),
  processRefund: (orderId, refundType, refundAmount) => request(`/payments/${orderId}/process-refund`, { method: 'POST', body: { refund_type: refundType, refund_amount: refundAmount } }),
}

export const interventionApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/interventions${qs ? '?' + qs : ''}`)
  },
  get: (id) => request(`/interventions/${id}`),
  create: (data) => request('/interventions', { method: 'POST', body: data }),
  process: (id, result, remark) => request(`/interventions/${id}/process`, { method: 'POST', body: { result, remark } }),
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

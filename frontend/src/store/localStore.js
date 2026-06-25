const now = () => new Date().toLocaleString('zh-CN', { hour12: false })
const uid = (pfx) => `${pfx}_${Date.now()}_${Math.floor(Math.random() * 1000)}`

export const PROFESSION_TYPES = [
  '保姆', '月嫂', '维修工', '保洁', '钟点工', '护工', '厨师', '育婴师', '搬家工', '家教'
]
export const PRICING_MODES = ['按小时计费', '按天计费', '按月计费', '按次计费']
export const AUTH_STATUS = {
  NOT_SUBMITTED: '未提交',
  PENDING: '待审核',
  APPROVED: '已通过',
  REJECTED: '已拒绝'
}
export const ORDER_STATUS = {
  PENDING_CONFIRM: '待确认',
  ACCEPTED: '已接单',
  IN_SERVICE: '服务中',
  EXCEPTION: '异常待处理',
  COMPLETED: '已完成',
  CANCELLED: '已取消'
}
export const ORDER_TRANSITIONS = {
  [ORDER_STATUS.PENDING_CONFIRM]: [ORDER_STATUS.ACCEPTED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.ACCEPTED]: [ORDER_STATUS.IN_SERVICE, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.IN_SERVICE]: [ORDER_STATUS.COMPLETED, ORDER_STATUS.EXCEPTION, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.EXCEPTION]: [ORDER_STATUS.IN_SERVICE, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.COMPLETED]: [],
  [ORDER_STATUS.CANCELLED]: []
}
export const ROLES = {
  USER: 'user',
  PROVIDER: 'provider',
  ADMIN: 'admin'
}
export const ROLE_LABELS = {
  [ROLES.USER]: '用户端',
  [ROLES.PROVIDER]: '服务商端',
  [ROLES.ADMIN]: '平台管理端'
}

function addRecord(orderId, role, action, detail, result) {
  state.operation_records.push({
    id: uid('rec'),
    order_id: orderId,
    role,
    role_label: ROLE_LABELS[role] || role,
    action,
    detail,
    result,
    created_at: now()
  })
}

function buildInitial() {
  const makeProvider = (data, authStatus, authInfo = {}) => {
    const id = uid('provider')
    return {
      id,
      name: data.name,
      profession_type: data.profession_type,
      service_area: data.service_area,
      service_tags: data.service_tags || [],
      pricing_mode: data.pricing_mode || '',
      price_range: data.price_range || '',
      intro: data.intro || '',
      phone: data.phone || '',
      avatar: '',
      created_at: now(),
      auth: {
        id: uid('auth'),
        provider_id: id,
        real_name: authInfo.real_name || '',
        id_card_number: authInfo.id_card_number || '',
        id_card_front: '',
        id_card_back: '',
        status: authStatus,
        reject_reason: authInfo.reject_reason || '',
        submitted_at: authStatus !== AUTH_STATUS.NOT_SUBMITTED ? now() : null,
        reviewed_at: (authStatus === AUTH_STATUS.APPROVED || authStatus === AUTH_STATUS.REJECTED) ? now() : null
      }
    }
  }

  const p1 = makeProvider(
    { name: '张阿姨', profession_type: '月嫂', service_area: '朝阳区,海淀区',
      service_tags: ['金牌月嫂', '5年经验', '会做月子餐'],
      pricing_mode: '按月计费', price_range: '12000-18000',
      intro: '从事母婴护理行业8年，持证上岗，服务过100+家庭。', phone: '138****1234' },
    AUTH_STATUS.APPROVED, { real_name: '张桂芳', id_card_number: '110101198501011234' }
  )
  const p2 = makeProvider(
    { name: '李师傅', profession_type: '维修工', service_area: '西城区,东城区,朝阳区',
      service_tags: ['水电维修', '家电维修', '24小时上门'],
      pricing_mode: '按次计费', price_range: '100-500',
      intro: '10年家电维修经验，精通各类家电故障排查与维修。', phone: '139****5678' },
    AUTH_STATUS.PENDING, { real_name: '李建国', id_card_number: '110101198005055678' }
  )
  const p3 = makeProvider(
    { name: '王大姐', profession_type: '保姆', service_area: '海淀区,丰台区',
      service_tags: ['照顾老人', '做饭好吃', '干净利索'],
      pricing_mode: '按月计费', price_range: '6000-9000',
      intro: '做家政工作5年，擅长照顾老人和做家务。', phone: '137****9012' },
    AUTH_STATUS.REJECTED, { real_name: '王秀兰', reject_reason: '身份证件照片不清晰，请重新上传' }
  )
  const p4 = makeProvider(
    { name: '赵师傅', profession_type: '维修工', service_area: '朝阳区,通州区',
      service_tags: ['管道疏通', '马桶维修', '水管漏水'],
      pricing_mode: '按次计费', price_range: '80-300',
      intro: '专业管道疏通维修15年，快速上门。', phone: '136****3456' },
    AUTH_STATUS.NOT_SUBMITTED
  )
  const p5 = makeProvider(
    { name: '陈阿姨', profession_type: '保洁', service_area: '全市',
      service_tags: ['深度保洁', '开荒保洁', '擦玻璃'],
      pricing_mode: '按小时计费', price_range: '40-60',
      intro: '专业保洁服务，干净认真。', phone: '135****7890' },
    AUTH_STATUS.APPROVED, { real_name: '陈美丽', id_card_number: '110101198810104321' }
  )

  const demandId = uid('demand')
  const d1 = {
    id: demandId,
    user_id: 'user_001',
    user_name: '用户小明',
    profession_type: '月嫂',
    location: '朝阳区建国路88号',
    budget: 15000,
    expected_time: '2026-07-15',
    remark: '需要有金牌月嫂证书，会做月子餐',
    created_at: now(),
    status: 'OPEN'
  }

  const orderId = uid('order')
  const o1 = {
    id: orderId,
    demand_id: demandId,
    provider_id: p1.id,
    provider_name: p1.name,
    user_id: 'user_001',
    user_name: '用户小明',
    profession_type: '月嫂',
    location: '朝阳区建国路88号',
    budget: 15000,
    expected_time: '2026-07-15',
    remark: '需要有金牌月嫂证书，会做月子餐',
    status: ORDER_STATUS.PENDING_CONFIRM,
    cancel_reason: '',
    exception_remark: '',
    created_at: now(),
    accepted_at: null,
    started_at: null,
    completed_at: null,
    cancelled_at: null,
    exception_at: null,
    resolved_at: null
  }

  const initRecords = [
    { id: uid('rec'), order_id: orderId, role: ROLES.USER, role_label: '用户端', action: '发起下单', detail: '用户小明对服务商张阿姨发起下单', result: '订单创建成功，状态：待确认', created_at: o1.created_at },
    { id: uid('rec'), order_id: orderId, role: ROLES.ADMIN, role_label: '平台管理端', action: '审核实名认证', detail: '审核服务商张桂芳的实名认证', result: '审核通过', created_at: p1.auth.reviewed_at },
  ]

  return {
    providers: [p1, p2, p3, p4, p5],
    demands: [d1],
    orders: [o1],
    operation_records: initRecords,
    currentRole: ROLES.USER,
    currentProviderId: p1.id,
    currentUserId: 'user_001',
    currentUserName: '用户小明'
  }
}

const STORAGE_KEY = 'intermediary_platform_state_v2'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.operation_records) return parsed
    }
  } catch (e) {}
  const init = buildInitial()
  save(init)
  return init
}

function save(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch (e) {}
}

let state = load()
const listeners = new Set()

function emit() {
  save(state)
  listeners.forEach(fn => fn(state))
}

export const store = {
  getState: () => state,
  subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn) },
  setRole: (role) => { state.currentRole = role; emit() },
  setCurrentProviderId: (id) => { state.currentProviderId = id; emit() },

  listProviders: (filter = {}) => {
    let list = state.providers.slice()
    if (filter.profession_type) list = list.filter(p => p.profession_type === filter.profession_type)
    if (filter.auth_status) list = list.filter(p => p.auth.status === filter.auth_status)
    return list
  },
  getProvider: (id) => state.providers.find(p => p.id === id),
  createProvider: (data) => {
    const p = {
      id: uid('provider'),
      name: data.name,
      profession_type: data.profession_type,
      service_area: data.service_area,
      service_tags: data.service_tags || [],
      pricing_mode: data.pricing_mode || '',
      price_range: data.price_range || '',
      intro: data.intro || '',
      phone: data.phone || '',
      avatar: '',
      created_at: now(),
      auth: {
        id: uid('auth'),
        provider_id: '',
        real_name: '',
        id_card_number: '',
        id_card_front: '',
        id_card_back: '',
        status: AUTH_STATUS.NOT_SUBMITTED,
        reject_reason: '',
        submitted_at: null,
        reviewed_at: null
      }
    }
    p.auth.provider_id = p.id
    state.providers.push(p)
    state.currentProviderId = p.id
    emit()
    return p
  },
  updateProvider: (id, data) => {
    const p = state.providers.find(p => p.id === id)
    if (!p) return null
    Object.assign(p, {
      name: data.name ?? p.name,
      profession_type: data.profession_type ?? p.profession_type,
      service_area: data.service_area ?? p.service_area,
      service_tags: data.service_tags ?? p.service_tags,
      pricing_mode: data.pricing_mode ?? p.pricing_mode,
      price_range: data.price_range ?? p.price_range,
      intro: data.intro ?? p.intro,
      phone: data.phone ?? p.phone
    })
    emit()
    return p
  },

  getAuth: (providerId) => {
    const p = state.providers.find(p => p.id === providerId)
    return p ? p.auth : null
  },
  submitAuth: (providerId, data) => {
    const p = state.providers.find(p => p.id === providerId)
    if (!p) return null
    p.auth = {
      ...p.auth,
      real_name: data.real_name,
      id_card_number: data.id_card_number,
      id_card_front: data.id_card_front,
      id_card_back: data.id_card_back,
      status: AUTH_STATUS.PENDING,
      reject_reason: '',
      submitted_at: now(),
      reviewed_at: null
    }
    emit()
    return p.auth
  },
  approveAuth: (providerId) => {
    const p = state.providers.find(p => p.id === providerId)
    if (!p) return null
    p.auth.status = AUTH_STATUS.APPROVED
    p.auth.reject_reason = ''
    p.auth.reviewed_at = now()
    emit()
    return p.auth
  },
  rejectAuth: (providerId, reason) => {
    const p = state.providers.find(p => p.id === providerId)
    if (!p) return null
    p.auth.status = AUTH_STATUS.REJECTED
    p.auth.reject_reason = reason
    p.auth.reviewed_at = now()
    emit()
    return p.auth
  },

  listDemands: () => state.demands.slice(),
  getDemand: (id) => state.demands.find(d => d.id === id),
  createDemand: (data) => {
    const d = {
      id: uid('demand'),
      user_id: state.currentUserId,
      user_name: state.currentUserName,
      profession_type: data.profession_type,
      location: data.location,
      budget: Number(data.budget),
      expected_time: data.expected_time,
      remark: data.remark || '',
      created_at: now(),
      status: 'OPEN'
    }
    state.demands.push(d)
    emit()
    return d
  },

  listOrders: (filter = {}) => {
    let list = state.orders.slice()
    if (filter.user_id) list = list.filter(o => o.user_id === filter.user_id)
    if (filter.provider_id) list = list.filter(o => o.provider_id === filter.provider_id)
    if (filter.status) list = list.filter(o => o.status === filter.status)
    return list
  },
  getOrder: (id) => state.orders.find(o => o.id === id),
  getOrderRecords: (orderId) => state.operation_records.filter(r => r.order_id === orderId),
  getAllRecords: () => state.operation_records.slice(),
  createOrder: (data) => {
    const exists = state.orders.find(o =>
      o.provider_id === data.provider_id &&
      o.user_id === (data.user_id || state.currentUserId) &&
      [ORDER_STATUS.PENDING_CONFIRM, ORDER_STATUS.ACCEPTED, ORDER_STATUS.IN_SERVICE, ORDER_STATUS.EXCEPTION].includes(o.status)
    )
    if (exists) return { error: '该服务商已有进行中的订单，请勿重复提交' }

    const provider = state.providers.find(p => p.id === data.provider_id)
    const demand = data.demand_id ? state.demands.find(d => d.id === data.demand_id) : null

    const order = {
      id: uid('order'),
      demand_id: data.demand_id || '',
      provider_id: data.provider_id,
      provider_name: provider ? provider.name : '',
      user_id: data.user_id || state.currentUserId,
      user_name: data.user_name || state.currentUserName,
      profession_type: data.profession_type || (demand ? demand.profession_type : ''),
      location: data.location || (demand ? demand.location : ''),
      budget: Number(data.budget || (demand ? demand.budget : 0)),
      expected_time: data.expected_time || (demand ? demand.expected_time : ''),
      remark: data.remark || (demand ? demand.remark : ''),
      status: ORDER_STATUS.PENDING_CONFIRM,
      cancel_reason: '',
      exception_remark: '',
      created_at: now(),
      accepted_at: null,
      started_at: null,
      completed_at: null,
      cancelled_at: null,
      exception_at: null,
      resolved_at: null
    }
    state.orders.push(order)
    addRecord(order.id, ROLES.USER, '发起下单', `用户${order.user_name}对服务商${order.provider_name}发起下单`, '订单创建成功，状态：待确认')
    emit()
    return order
  },
  acceptOrder: (id) => {
    const o = state.orders.find(o => o.id === id)
    if (!o) return { error: '订单不存在' }
    if (!ORDER_TRANSITIONS[o.status].includes(ORDER_STATUS.ACCEPTED)) return { error: '当前状态无法接单' }
    const p = state.providers.find(p => p.id === o.provider_id)
    if (p && p.auth.status !== AUTH_STATUS.APPROVED) return { error: '未通过实名认证的服务商不能接单，请先完成认证' }
    o.status = ORDER_STATUS.ACCEPTED
    o.accepted_at = now()
    addRecord(id, ROLES.PROVIDER, '接单', `服务商${o.provider_name}确认接单`, '订单状态变更为：已接单')
    emit()
    return o
  },
  startOrder: (id) => {
    const o = state.orders.find(o => o.id === id)
    if (!o) return { error: '订单不存在' }
    if (!ORDER_TRANSITIONS[o.status].includes(ORDER_STATUS.IN_SERVICE)) return { error: '当前状态无法开始服务' }
    o.status = ORDER_STATUS.IN_SERVICE
    o.started_at = now()
    addRecord(id, ROLES.PROVIDER, '开始服务', `服务商${o.provider_name}开始提供服务`, '订单状态变更为：服务中')
    emit()
    return o
  },
  completeOrder: (id) => {
    const o = state.orders.find(o => o.id === id)
    if (!o) return { error: '订单不存在' }
    if (!ORDER_TRANSITIONS[o.status].includes(ORDER_STATUS.COMPLETED)) return { error: '当前状态无法完成' }
    o.status = ORDER_STATUS.COMPLETED
    o.completed_at = now()
    addRecord(id, ROLES.PROVIDER, '完成服务', `服务商${o.provider_name}完成本次服务`, '订单状态变更为：已完成')
    emit()
    return o
  },
  cancelOrder: (id, reason) => {
    const o = state.orders.find(o => o.id === id)
    if (!o) return { error: '订单不存在' }
    if (!ORDER_TRANSITIONS[o.status].includes(ORDER_STATUS.CANCELLED)) return { error: '当前状态无法取消' }
    if (!reason || !reason.trim()) return { error: '取消原因不能为空' }
    o.status = ORDER_STATUS.CANCELLED
    o.cancel_reason = reason.trim()
    o.cancelled_at = now()
    const role = state.currentRole
    addRecord(id, role, '取消订单', `${ROLE_LABELS[role]}取消订单，原因：${reason.trim()}`, '订单状态变更为：已取消')
    emit()
    return o
  },
  escalateOrder: (id, remark) => {
    const o = state.orders.find(o => o.id === id)
    if (!o) return { error: '订单不存在' }
    if (o.status !== ORDER_STATUS.IN_SERVICE) return { error: '仅服务中的订单可标记异常' }
    if (!remark || !remark.trim()) return { error: '异常处理备注不能为空' }
    o.status = ORDER_STATUS.EXCEPTION
    o.exception_remark = remark.trim()
    o.exception_at = now()
    addRecord(id, state.currentRole, '标记异常', `${ROLE_LABELS[state.currentRole]}标记订单异常，备注：${remark.trim()}`, '订单状态变更为：异常待处理')
    emit()
    return o
  },
  resolveOrder: (id, remark) => {
    const o = state.orders.find(o => o.id === id)
    if (!o) return { error: '订单不存在' }
    if (o.status !== ORDER_STATUS.EXCEPTION) return { error: '仅异常待处理的订单可恢复服务' }
    if (!remark || !remark.trim()) return { error: '异常处理备注不能为空' }
    o.status = ORDER_STATUS.IN_SERVICE
    o.resolved_at = now()
    addRecord(id, ROLES.ADMIN, '恢复服务', `平台管理端处理异常并恢复服务，备注：${remark.trim()}`, '订单状态变更为：服务中')
    emit()
    return o
  },

  stats: () => {
    const providers = state.providers
    const orders = state.orders
    const authStats = { [AUTH_STATUS.NOT_SUBMITTED]: 0, [AUTH_STATUS.PENDING]: 0, [AUTH_STATUS.APPROVED]: 0, [AUTH_STATUS.REJECTED]: 0 }
    providers.forEach(p => { authStats[p.auth.status] = (authStats[p.auth.status] || 0) + 1 })
    const orderStats = Object.values(ORDER_STATUS).reduce((acc, s) => { acc[s] = 0; return acc }, {})
    orders.forEach(o => { orderStats[o.status] = (orderStats[o.status] || 0) + 1 })
    return { total_providers: providers.length, total_orders: orders.length, total_records: state.operation_records.length, authStats, orderStats }
  },

  reset: () => { state = buildInitial(); emit() }
}

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

export const CONTRACT_STATUS = {
  PENDING_SIGN: '待签署',
  USER_SIGNED: '需求方已签',
  PROVIDER_SIGNED: '服务商已签',
  SIGNED: '已签署',
  REJECTED: '已拒签',
  VOID: '已作废'
}

export const CONTRACT_STATUS_COLOR = {
  待签署: '#faad14',
  需求方已签: '#1890ff',
  服务商已签: '#1890ff',
  已签署: '#52c41a',
  已拒签: '#ff4d4f',
  已作废: '#999'
}

export const PAYMENT_STATUS = {
  PENDING_ESCROW: '待托管',
  ESCROWED: '已托管',
  IN_SERVICE_CONFIRMABLE: '服务中可确认',
  PENDING_SETTLE: '待结算',
  SETTLED: '已结算',
  REFUND_PROCESSING: '退款处理中',
  REFUNDED: '已退款'
}

export const PAYMENT_STATUS_COLOR = {
  待托管: '#faad14',
  已托管: '#1890ff',
  服务中可确认: '#13c2c2',
  待结算: '#722ed1',
  已结算: '#52c41a',
  退款处理中: '#fa8c16',
  已退款: '#999'
}

export const INTERVENTION_STATUS = {
  PENDING: '待处理',
  PROCESSING: '处理中',
  RESOLVED: '已处理',
  CLOSED: '已关闭'
}

export const INTERVENTION_STATUS_COLOR = {
  待处理: '#ff4d4f',
  处理中: '#faad14',
  已处理: '#52c41a',
  已关闭: '#999'
}

export const INTERVENTION_RESULT = {
  CONTINUE: '继续履约',
  PARTIAL_REFUND: '部分退款',
  FULL_REFUND: '全额退款',
  REJECT: '驳回申请',
  MANUAL: '转人工跟进'
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

  const demandId2 = uid('demand')
  const d2 = {
    id: demandId2,
    user_id: 'user_001',
    user_name: '用户小明',
    profession_type: '保洁',
    location: '海淀区中关村大街1号',
    budget: 300,
    expected_time: '2026-07-10',
    remark: '深度保洁，擦玻璃',
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

  const orderId2 = uid('order')
  const o2 = {
    id: orderId2,
    demand_id: demandId2,
    provider_id: p5.id,
    provider_name: p5.name,
    user_id: 'user_001',
    user_name: '用户小明',
    profession_type: '保洁',
    location: '海淀区中关村大街1号',
    budget: 300,
    expected_time: '2026-07-10',
    remark: '深度保洁，擦玻璃',
    status: ORDER_STATUS.IN_SERVICE,
    cancel_reason: '',
    exception_remark: '',
    created_at: now(),
    accepted_at: now(),
    started_at: now(),
    completed_at: null,
    cancelled_at: null,
    exception_at: null,
    resolved_at: null
  }

  const c1 = {
    id: uid('contract'),
    order_id: orderId,
    order_no: orderId,
    user_id: 'user_001',
    user_name: '用户小明',
    provider_id: p1.id,
    provider_name: p1.name,
    profession_type: '月嫂',
    service_address: '朝阳区建国路88号',
    service_time: '2026-07-15 起，服务周期30天',
    price: 15000,
    service_commitment: '1. 每日服务8小时，包含产妇护理、新生儿护理、月子餐制作；2. 持证上岗，持有金牌月嫂证书；3. 服务期间如遇特殊情况可协商调整。',
    breach_terms: '1. 需求方违约：提前解除合同需支付已服务天数费用+3天服务费违约金；2. 服务商违约：擅自离岗或服务不达标，需求方可要求退换对应天数费用。',
    status: CONTRACT_STATUS.PENDING_SIGN,
    user_signed: false,
    provider_signed: false,
    user_signed_at: null,
    provider_signed_at: null,
    reject_reason: '',
    reject_by: '',
    void_reason: '',
    created_at: now()
  }

  const c2 = {
    id: uid('contract'),
    order_id: orderId2,
    order_no: orderId2,
    user_id: 'user_001',
    user_name: '用户小明',
    provider_id: p5.id,
    provider_name: p5.name,
    profession_type: '保洁',
    service_address: '海淀区中关村大街1号',
    service_time: '2026-07-10，服务时长4小时',
    price: 300,
    service_commitment: '1. 提供深度保洁服务，包含客厅、卧室、厨房、卫生间清洁；2. 提供玻璃内外清洁；3. 使用专业清洁设备和环保清洁剂。',
    breach_terms: '1. 服务未达标可要求返工或部分退款；2. 因服务商原因造成物品损坏需照价赔偿。',
    status: CONTRACT_STATUS.SIGNED,
    user_signed: true,
    provider_signed: true,
    user_signed_at: now(),
    provider_signed_at: now(),
    reject_reason: '',
    reject_by: '',
    void_reason: '',
    created_at: now()
  }

  const pay1 = {
    id: uid('pay'),
    order_id: orderId,
    order_no: orderId,
    user_id: 'user_001',
    user_name: '用户小明',
    provider_id: p1.id,
    provider_name: p1.name,
    amount: 15000,
    escrow_amount: 0,
    settled_amount: 0,
    refund_amount: 0,
    status: PAYMENT_STATUS.PENDING_ESCROW,
    escrowed_at: null,
    settled_at: null,
    refund_at: null,
    refund_reason: '',
    created_at: now()
  }

  const pay2 = {
    id: uid('pay'),
    order_id: orderId2,
    order_no: orderId2,
    user_id: 'user_001',
    user_name: '用户小明',
    provider_id: p5.id,
    provider_name: p5.name,
    amount: 300,
    escrow_amount: 300,
    settled_amount: 0,
    refund_amount: 0,
    status: PAYMENT_STATUS.IN_SERVICE_CONFIRMABLE,
    escrowed_at: now(),
    settled_at: null,
    refund_at: null,
    refund_reason: '',
    created_at: now()
  }

  const initRecords = [
    { id: uid('rec'), order_id: orderId, role: ROLES.USER, role_label: '用户端', action: '发起下单', detail: '用户小明对服务商张阿姨发起下单', result: '订单创建成功，状态：待确认', created_at: o1.created_at },
    { id: uid('rec'), order_id: orderId, role: ROLES.ADMIN, role_label: '平台管理端', action: '生成合同', detail: '系统根据订单信息自动生成服务合同', result: '合同已生成，等待双方签署', created_at: o1.created_at },
    { id: uid('rec'), order_id: orderId, role: ROLES.ADMIN, role_label: '平台管理端', action: '创建付款节点', detail: '系统根据订单金额创建担保付款节点', result: '付款节点已创建，等待托管', created_at: o1.created_at },
    { id: uid('rec'), order_id: orderId2, role: ROLES.USER, role_label: '用户端', action: '发起下单', detail: '用户小明对服务商陈阿姨发起下单', result: '订单创建成功', created_at: o2.created_at },
    { id: uid('rec'), order_id: orderId2, role: ROLES.PROVIDER, role_label: '服务商端', action: '接单', detail: '服务商陈阿姨确认接单', result: '订单状态变更为：已接单', created_at: o2.accepted_at },
    { id: uid('rec'), order_id: orderId2, role: ROLES.ADMIN, role_label: '平台管理端', action: '签署合同', detail: '需求方和服务商双方均已签署合同', result: '合同已签署', created_at: c2.user_signed_at },
    { id: uid('rec'), order_id: orderId2, role: ROLES.USER, role_label: '用户端', action: '托管付款', detail: '需求方托管服务费 ¥300', result: '款项已托管至平台', created_at: pay2.escrowed_at },
    { id: uid('rec'), order_id: orderId2, role: ROLES.PROVIDER, role_label: '服务商端', action: '开始服务', detail: '服务商陈阿姨开始提供服务', result: '订单状态变更为：服务中', created_at: o2.started_at },
    { id: uid('rec'), order_id: orderId, role: ROLES.ADMIN, role_label: '平台管理端', action: '审核实名认证', detail: '审核服务商张桂芳的实名认证', result: '审核通过', created_at: p1.auth.reviewed_at },
  ]

  return {
    providers: [p1, p2, p3, p4, p5],
    demands: [d1, d2],
    orders: [o1, o2],
    contracts: [c1, c2],
    payments: [pay1, pay2],
    interventions: [],
    operation_records: initRecords,
    currentRole: ROLES.USER,
    currentProviderId: p1.id,
    currentUserId: 'user_001',
    currentUserName: '用户小明'
  }
}

const STORAGE_KEY = 'intermediary_platform_state_v3'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.operation_records && parsed.contracts && parsed.payments && parsed.interventions !== undefined) return parsed
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

function ensureOrderDependencies(orderId) {
  const order = state.orders.find(o => o.id === orderId)
  if (!order) return null
  let contract = state.contracts.find(c => c.order_id === orderId)
  if (!contract) {
    contract = {
      id: uid('contract'),
      order_id: orderId,
      order_no: orderId,
      user_id: order.user_id,
      user_name: order.user_name,
      provider_id: order.provider_id,
      provider_name: order.provider_name,
      profession_type: order.profession_type,
      service_address: order.location,
      service_time: order.expected_time,
      price: order.budget,
      service_commitment: '服务商承诺按照约定提供专业服务，保证服务质量和时间。',
      breach_terms: '双方应严格按照合同履行义务，违约方应承担相应违约责任。',
      status: CONTRACT_STATUS.PENDING_SIGN,
      user_signed: false,
      provider_signed: false,
      user_signed_at: null,
      provider_signed_at: null,
      reject_reason: '',
      reject_by: '',
      void_reason: '',
      created_at: now()
    }
    state.contracts.push(contract)
    addRecord(orderId, ROLES.ADMIN, '生成合同', '系统根据订单信息自动生成服务合同', '合同已生成，等待双方签署')
  }
  let payment = state.payments.find(p => p.order_id === orderId)
  if (!payment) {
    payment = {
      id: uid('pay'),
      order_id: orderId,
      order_no: orderId,
      user_id: order.user_id,
      user_name: order.user_name,
      provider_id: order.provider_id,
      provider_name: order.provider_name,
      amount: order.budget,
      escrow_amount: 0,
      settled_amount: 0,
      refund_amount: 0,
      status: PAYMENT_STATUS.PENDING_ESCROW,
      escrowed_at: null,
      settled_at: null,
      refund_at: null,
      refund_reason: '',
      created_at: now()
    }
    state.payments.push(payment)
    addRecord(orderId, ROLES.ADMIN, '创建付款节点', '系统根据订单金额创建担保付款节点', '付款节点已创建，等待托管')
  }
  return { order, contract, payment }
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
  getOrder: (id) => {
    const order = state.orders.find(o => o.id === id)
    if (order) ensureOrderDependencies(id)
    return order
  },
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
    ensureOrderDependencies(order.id)
    emit()
    return order
  },
  acceptOrder: (id) => {
    const o = state.orders.find(o => o.id === id)
    if (!o) return { error: '订单不存在' }
    if (!ORDER_TRANSITIONS[o.status].includes(ORDER_STATUS.ACCEPTED)) return { error: '当前状态无法接单' }
    const p = state.providers.find(p => p.id === o.provider_id)
    if (p && p.auth.status !== AUTH_STATUS.APPROVED) return { error: '未通过实名认证的服务商不能接单，请先完成认证' }
    const contract = state.contracts.find(c => c.order_id === id)
    if (!contract) return { error: '合同尚未生成，请稍后重试' }
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
    const contract = state.contracts.find(c => c.order_id === id)
    if (!contract || contract.status !== CONTRACT_STATUS.SIGNED) {
      return { error: '合同尚未签署完成，不能开始服务' }
    }
    const payment = state.payments.find(p => p.order_id === id)
    if (!payment || payment.status !== PAYMENT_STATUS.ESCROWED && payment.status !== PAYMENT_STATUS.IN_SERVICE_CONFIRMABLE) {
      return { error: '款项尚未托管，不能开始服务' }
    }
    o.status = ORDER_STATUS.IN_SERVICE
    o.started_at = now()
    if (payment && payment.status === PAYMENT_STATUS.ESCROWED) {
      payment.status = PAYMENT_STATUS.IN_SERVICE_CONFIRMABLE
    }
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
    const payment = state.payments.find(p => p.order_id === id)
    if (payment && payment.status === PAYMENT_STATUS.IN_SERVICE_CONFIRMABLE) {
      payment.status = PAYMENT_STATUS.PENDING_SETTLE
    }
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

  listContracts: (filter = {}) => {
    let list = state.contracts.slice()
    if (filter.user_id) list = list.filter(c => c.user_id === filter.user_id)
    if (filter.provider_id) list = list.filter(c => c.provider_id === filter.provider_id)
    if (filter.status) list = list.filter(c => c.status === filter.status)
    if (filter.order_id) list = list.filter(c => c.order_id === filter.order_id)
    return list
  },
  getContract: (id) => state.contracts.find(c => c.id === id),
  getContractByOrder: (orderId) => {
    ensureOrderDependencies(orderId)
    return state.contracts.find(c => c.order_id === orderId)
  },
  updateContract: (contractId, data) => {
    const c = state.contracts.find(c => c.id === contractId)
    if (!c) return { error: '合同不存在' }
    if (c.status === CONTRACT_STATUS.SIGNED || c.status === CONTRACT_STATUS.VOID) {
      return { error: '当前合同状态不可修改' }
    }
    if (!data.service_commitment || !data.service_commitment.trim()) {
      return { error: '服务承诺不能为空' }
    }
    if (!data.breach_terms || !data.breach_terms.trim()) {
      return { error: '违约说明不能为空' }
    }
    c.service_commitment = data.service_commitment.trim()
    c.breach_terms = data.breach_terms.trim()
    if (data.service_address) c.service_address = data.service_address
    if (data.service_time) c.service_time = data.service_time
    if (data.price) c.price = Number(data.price)
    addRecord(c.order_id, state.currentRole, '修改合同', `${ROLE_LABELS[state.currentRole]}修改合同条款`, '合同条款已更新')
    emit()
    return c
  },
  signContract: (contractId) => {
    const c = state.contracts.find(c => c.id === contractId)
    if (!c) return { error: '合同不存在' }
    if (c.status === CONTRACT_STATUS.VOID) return { error: '合同已作废，无法签署' }
    if (c.status === CONTRACT_STATUS.SIGNED) return { error: '合同已签署，无需重复签署' }
    if (c.status === CONTRACT_STATUS.REJECTED) return { error: '合同已拒签，请重新协商后签署' }
    if (!c.service_commitment || !c.service_commitment.trim()) return { error: '合同服务承诺缺失，请先完善' }
    if (!c.breach_terms || !c.breach_terms.trim()) return { error: '合同违约说明缺失，请先完善' }

    const role = state.currentRole
    if (role === ROLES.USER) {
      if (c.user_signed) return { error: '需求方已签署，无需重复签署' }
      c.user_signed = true
      c.user_signed_at = now()
      if (c.provider_signed) {
        c.status = CONTRACT_STATUS.SIGNED
      } else {
        c.status = CONTRACT_STATUS.USER_SIGNED
      }
      addRecord(c.order_id, ROLES.USER, '签署合同', '需求方签署服务合同', c.status === CONTRACT_STATUS.SIGNED ? '合同已完全签署' : '需求方已签署，等待服务商签署')
    } else if (role === ROLES.PROVIDER) {
      if (c.provider_signed) return { error: '服务商已签署，无需重复签署' }
      c.provider_signed = true
      c.provider_signed_at = now()
      if (c.user_signed) {
        c.status = CONTRACT_STATUS.SIGNED
      } else {
        c.status = CONTRACT_STATUS.PROVIDER_SIGNED
      }
      addRecord(c.order_id, ROLES.PROVIDER, '签署合同', '服务商签署服务合同', c.status === CONTRACT_STATUS.SIGNED ? '合同已完全签署' : '服务商已签署，等待需求方签署')
    } else {
      return { error: '当前角色无权限签署合同' }
    }
    emit()
    return c
  },
  rejectContract: (contractId, reason) => {
    const c = state.contracts.find(c => c.id === contractId)
    if (!c) return { error: '合同不存在' }
    if (c.status === CONTRACT_STATUS.VOID) return { error: '合同已作废' }
    if (c.status === CONTRACT_STATUS.SIGNED) return { error: '合同已签署，无法拒签' }
    if (!reason || !reason.trim()) return { error: '拒签原因不能为空' }
    const role = state.currentRole
    if (role !== ROLES.USER && role !== ROLES.PROVIDER) {
      return { error: '当前角色无权限拒签合同' }
    }
    c.status = CONTRACT_STATUS.REJECTED
    c.reject_reason = reason.trim()
    c.reject_by = role === ROLES.USER ? '需求方' : '服务商'
    addRecord(c.order_id, role, '拒签合同', `${c.reject_by}拒签合同，原因：${reason.trim()}`, '合同已拒签')
    emit()
    return c
  },
  voidContract: (contractId, reason) => {
    const c = state.contracts.find(c => c.id === contractId)
    if (!c) return { error: '合同不存在' }
    if (state.currentRole !== ROLES.ADMIN) return { error: '仅平台管理端可作废合同' }
    if (!reason || !reason.trim()) return { error: '作废原因不能为空' }
    c.status = CONTRACT_STATUS.VOID
    c.void_reason = reason.trim()
    addRecord(c.order_id, ROLES.ADMIN, '作废合同', `平台管理端作废合同，原因：${reason.trim()}`, '合同已作废')
    emit()
    return c
  },

  listPayments: (filter = {}) => {
    let list = state.payments.slice()
    if (filter.user_id) list = list.filter(p => p.user_id === filter.user_id)
    if (filter.provider_id) list = list.filter(p => p.provider_id === filter.provider_id)
    if (filter.status) list = list.filter(p => p.status === filter.status)
    if (filter.order_id) list = list.filter(p => p.order_id === filter.order_id)
    return list
  },
  getPayment: (id) => state.payments.find(p => p.id === id),
  getPaymentByOrder: (orderId) => {
    ensureOrderDependencies(orderId)
    return state.payments.find(p => p.order_id === orderId)
  },
  escrowPayment: (orderId, amount) => {
    const payment = state.payments.find(p => p.order_id === orderId)
    if (!payment) return { error: '付款记录不存在' }
    if (state.currentRole !== ROLES.USER) return { error: '仅需求方可以发起托管付款' }
    if (payment.status !== PAYMENT_STATUS.PENDING_ESCROW) return { error: '当前状态无法托管，请勿重复操作' }
    const numAmount = Number(amount)
    if (!numAmount || numAmount <= 0) return { error: '托管金额不合法' }
    if (Math.abs(numAmount - payment.amount) > 0.01) return { error: `托管金额应与订单金额一致，应为 ¥${payment.amount}` }
    payment.status = PAYMENT_STATUS.ESCROWED
    payment.escrow_amount = numAmount
    payment.escrowed_at = now()
    addRecord(orderId, ROLES.USER, '托管付款', `需求方托管服务费 ¥${numAmount}`, '款项已托管至平台')
    emit()
    return payment
  },
  confirmServiceComplete: (orderId) => {
    const o = state.orders.find(o => o.id === orderId)
    const payment = state.payments.find(p => p.order_id === orderId)
    if (!payment) return { error: '付款记录不存在' }
    if (state.currentRole !== ROLES.USER) return { error: '仅需求方可以确认服务完成' }
    if (payment.status !== PAYMENT_STATUS.IN_SERVICE_CONFIRMABLE) return { error: '当前状态不可确认服务完成' }
    if (!o || o.status !== ORDER_STATUS.IN_SERVICE) return { error: '服务尚未进行中，无法确认完成' }
    o.status = ORDER_STATUS.COMPLETED
    o.completed_at = now()
    payment.status = PAYMENT_STATUS.PENDING_SETTLE
    addRecord(orderId, ROLES.USER, '确认服务完成', '需求方确认服务完成，等待结算', '订单状态：已完成，付款状态：待结算')
    emit()
    return payment
  },
  applyRefund: (orderId, reason) => {
    const payment = state.payments.find(p => p.order_id === orderId)
    if (!payment) return { error: '付款记录不存在' }
    if (state.currentRole !== ROLES.USER) return { error: '仅需求方可以申请退款' }
    if (!reason || !reason.trim()) return { error: '退款原因不能为空' }
    if ([PAYMENT_STATUS.PENDING_ESCROW, PAYMENT_STATUS.SETTLED, PAYMENT_STATUS.REFUNDED, PAYMENT_STATUS.REFUND_PROCESSING].includes(payment.status)) {
      return { error: '当前付款状态无法申请退款' }
    }
    payment.status = PAYMENT_STATUS.REFUND_PROCESSING
    payment.refund_reason = reason.trim()
    addRecord(orderId, ROLES.USER, '申请退款', `需求方申请退款，原因：${reason.trim()}`, '退款处理中，等待平台处理')
    emit()
    return payment
  },
  settlePayment: (orderId) => {
    const payment = state.payments.find(p => p.order_id === orderId)
    if (!payment) return { error: '付款记录不存在' }
    if (state.currentRole !== ROLES.ADMIN) return { error: '仅平台管理端可以结算' }
    if (payment.status !== PAYMENT_STATUS.PENDING_SETTLE) return { error: '当前状态不可结算' }
    payment.status = PAYMENT_STATUS.SETTLED
    payment.settled_amount = payment.escrow_amount
    payment.settled_at = now()
    addRecord(orderId, ROLES.ADMIN, '结算付款', `平台结算 ¥${payment.settled_amount} 给服务商${payment.provider_name}`, '付款已结算')
    emit()
    return payment
  },
  processRefund: (orderId, refundType, refundAmount) => {
    const payment = state.payments.find(p => p.order_id === orderId)
    const o = state.orders.find(o => o.id === orderId)
    if (!payment) return { error: '付款记录不存在' }
    if (state.currentRole !== ROLES.ADMIN) return { error: '仅平台管理端可以处理退款' }
    if (payment.status !== PAYMENT_STATUS.REFUND_PROCESSING) return { error: '当前状态无需退款处理' }
    const amount = Number(refundAmount) || 0
    if (refundType === 'full') {
      payment.status = PAYMENT_STATUS.REFUNDED
      payment.refund_amount = payment.escrow_amount
      payment.refund_at = now()
      if (o && o.status !== ORDER_STATUS.COMPLETED && o.status !== ORDER_STATUS.CANCELLED) {
        o.status = ORDER_STATUS.CANCELLED
        o.cancelled_at = now()
      }
      addRecord(orderId, ROLES.ADMIN, '处理退款', `平台处理全额退款 ¥${payment.refund_amount}`, '款项已全额退还需求方')
    } else if (refundType === 'partial') {
      if (amount <= 0 || amount >= payment.escrow_amount) return { error: '部分退款金额必须大于0且小于托管金额' }
      payment.status = PAYMENT_STATUS.SETTLED
      payment.refund_amount = amount
      payment.settled_amount = payment.escrow_amount - amount
      payment.refund_at = now()
      payment.settled_at = now()
      addRecord(orderId, ROLES.ADMIN, '处理退款', `平台处理部分退款 ¥${amount}，结算 ¥${payment.settled_amount} 给服务商`, '部分退款完成')
    } else if (refundType === 'reject') {
      payment.status = PAYMENT_STATUS.PENDING_SETTLE
      payment.refund_reason = payment.refund_reason + '（退款申请已驳回）'
      addRecord(orderId, ROLES.ADMIN, '驳回退款', '平台驳回退款申请', '付款恢复待结算状态')
    }
    emit()
    return payment
  },

  listInterventions: (filter = {}) => {
    let list = state.interventions.slice()
    if (filter.user_id) list = list.filter(i => i.initiator_id === filter.user_id && i.initiator_role === ROLES.USER)
    if (filter.provider_id) list = list.filter(i => i.initiator_id === filter.provider_id && i.initiator_role === ROLES.PROVIDER)
    if (filter.status) list = list.filter(i => i.status === filter.status)
    if (filter.order_id) list = list.filter(i => i.order_id === filter.order_id)
    return list
  },
  getIntervention: (id) => state.interventions.find(i => i.id === id),
  createIntervention: (data) => {
    const order = state.orders.find(o => o.id === data.order_id)
    if (!order) return { error: '订单不存在' }
    if ([ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED].includes(order.status)) {
      return { error: '订单已完成或已取消，不能发起介入申请' }
    }
    if (!data.reason || !data.reason.trim()) return { error: '介入原因不能为空' }
    if (!data.appeal || !data.appeal.trim()) return { error: '诉求内容不能为空' }

    const role = state.currentRole
    const initiatorId = role === ROLES.USER ? state.currentUserId : state.currentProviderId
    const initiatorName = role === ROLES.USER ? state.currentUserName : order.provider_name

    const intervention = {
      id: uid('iv'),
      order_id: data.order_id,
      order_no: data.order_id,
      initiator_role: role,
      initiator_id: initiatorId,
      initiator_name: initiatorName,
      reason: data.reason.trim(),
      appeal: data.appeal.trim(),
      remark: data.remark || '',
      status: INTERVENTION_STATUS.PENDING,
      result: '',
      result_remark: '',
      processed_by: '',
      processed_at: null,
      created_at: now()
    }
    state.interventions.push(intervention)
    addRecord(data.order_id, role, '发起平台介入', `原因：${data.reason.trim()}，诉求：${data.appeal.trim()}`, '介入申请已提交，等待平台处理')
    emit()
    return intervention
  },
  processIntervention: (interventionId, result, remark) => {
    const iv = state.interventions.find(i => i.id === interventionId)
    if (!iv) return { error: '介入单不存在' }
    if (state.currentRole !== ROLES.ADMIN) return { error: '仅平台管理端可以处理介入申请' }
    if (iv.status === INTERVENTION_STATUS.RESOLVED || iv.status === INTERVENTION_STATUS.CLOSED) {
      return { error: '该介入单已处理完成' }
    }
    if (!result) return { error: '请选择处理结果' }
    if (!remark || !remark.trim()) return { error: '处理意见不能为空' }

    iv.status = INTERVENTION_STATUS.RESOLVED
    iv.result = result
    iv.result_remark = remark.trim()
    iv.processed_by = '平台管理员'
    iv.processed_at = now()

    const order = state.orders.find(o => o.id === iv.order_id)
    const payment = state.payments.find(p => p.order_id === iv.order_id)

    if (result === INTERVENTION_RESULT.FULL_REFUND) {
      if (payment && payment.escrow_amount > 0 && payment.status !== PAYMENT_STATUS.REFUNDED) {
        payment.status = PAYMENT_STATUS.REFUNDED
        payment.refund_amount = payment.escrow_amount
        payment.refund_at = now()
      }
      if (order && ![ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED].includes(order.status)) {
        order.status = ORDER_STATUS.CANCELLED
        order.cancelled_at = now()
      }
    } else if (result === INTERVENTION_RESULT.PARTIAL_REFUND) {
      if (payment && payment.escrow_amount > 0 && payment.status !== PAYMENT_STATUS.REFUNDED) {
        const partial = Math.floor(payment.escrow_amount / 2)
        payment.status = PAYMENT_STATUS.SETTLED
        payment.refund_amount = partial
        payment.settled_amount = payment.escrow_amount - partial
        payment.refund_at = now()
        payment.settled_at = now()
      }
    } else if (result === INTERVENTION_RESULT.CONTINUE) {
      if (order && order.status === ORDER_STATUS.EXCEPTION) {
        order.status = ORDER_STATUS.IN_SERVICE
        order.resolved_at = now()
      }
    }

    addRecord(iv.order_id, ROLES.ADMIN, '处理平台介入', `处理结果：${result}，处理意见：${remark.trim()}`, `介入申请已处理：${result}`)
    emit()
    return iv
  },

  stats: () => {
    const providers = state.providers
    const orders = state.orders
    const contracts = state.contracts
    const payments = state.payments
    const interventions = state.interventions

    const authStats = { [AUTH_STATUS.NOT_SUBMITTED]: 0, [AUTH_STATUS.PENDING]: 0, [AUTH_STATUS.APPROVED]: 0, [AUTH_STATUS.REJECTED]: 0 }
    providers.forEach(p => { authStats[p.auth.status] = (authStats[p.auth.status] || 0) + 1 })

    const orderStats = Object.values(ORDER_STATUS).reduce((acc, s) => { acc[s] = 0; return acc }, {})
    orders.forEach(o => { orderStats[o.status] = (orderStats[o.status] || 0) + 1 })

    const contractStats = Object.values(CONTRACT_STATUS).reduce((acc, s) => { acc[s] = 0; return acc }, {})
    contracts.forEach(c => { contractStats[c.status] = (contractStats[c.status] || 0) + 1 })

    const paymentStats = Object.values(PAYMENT_STATUS).reduce((acc, s) => { acc[s] = 0; return acc }, {})
    payments.forEach(p => { paymentStats[p.status] = (paymentStats[p.status] || 0) + 1 })

    const interventionStats = Object.values(INTERVENTION_STATUS).reduce((acc, s) => { acc[s] = 0; return acc }, {})
    interventions.forEach(i => { interventionStats[i.status] = (interventionStats[i.status] || 0) + 1 })

    const pendingSettleAmount = payments
      .filter(p => p.status === PAYMENT_STATUS.PENDING_SETTLE)
      .reduce((sum, p) => sum + (p.escrow_amount || 0), 0)

    const escrowedAmount = payments
      .filter(p => [PAYMENT_STATUS.ESCROWED, PAYMENT_STATUS.IN_SERVICE_CONFIRMABLE, PAYMENT_STATUS.REFUND_PROCESSING].includes(p.status))
      .reduce((sum, p) => sum + (p.escrow_amount || 0), 0)

    const settledAmount = payments
      .filter(p => p.status === PAYMENT_STATUS.SETTLED)
      .reduce((sum, p) => sum + (p.settled_amount || 0), 0)

    const refundedAmount = payments
      .filter(p => [PAYMENT_STATUS.REFUNDED, PAYMENT_STATUS.REFUND_PROCESSING].includes(p.status))
      .reduce((sum, p) => sum + (p.refund_amount || 0), 0)

    return {
      total_providers: providers.length,
      total_orders: orders.length,
      total_contracts: contracts.length,
      total_payments: payments.length,
      total_interventions: interventions.length,
      total_records: state.operation_records.length,
      authStats,
      orderStats,
      contractStats,
      paymentStats,
      interventionStats,
      pending_sign_contracts: contractStats[CONTRACT_STATUS.PENDING_SIGN] || 0,
      pending_escrow_payments: paymentStats[PAYMENT_STATUS.PENDING_ESCROW] || 0,
      pending_interventions: interventionStats[INTERVENTION_STATUS.PENDING] || 0,
      pending_settle_amount: pendingSettleAmount,
      escrowed_amount: escrowedAmount,
      settled_amount: settledAmount,
      refunded_amount: refundedAmount
    }
  },

  reset: () => { state = buildInitial(); emit() }
}

export const AUTH_STATUS = {
  NOT_SUBMITTED: '未提交',
  PENDING: '待审核',
  APPROVED: '已通过',
  REJECTED: '已拒绝',
}

export const ORDER_STATUS = {
  PENDING_CONFIRM: '待确认',
  ACCEPTED: '已接单',
  IN_SERVICE: '服务中',
  EXCEPTION: '异常待处理',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
}

export const CONTRACT_STATUS = {
  PENDING_SIGN: '待签署',
  USER_SIGNED: '需求方已签',
  PROVIDER_SIGNED: '服务商已签',
  SIGNED: '已签署',
  REJECTED: '已拒签',
  VOID: '已作废'
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

export const INTERVENTION_STATUS = {
  PENDING: '待处理',
  PROCESSING: '处理中',
  RESOLVED: '已处理',
  CLOSED: '已关闭'
}

export const AUTH_STATUS_COLOR = {
  未提交: '#999',
  待审核: '#faad14',
  已通过: '#52c41a',
  已拒绝: '#ff4d4f',
}

export const ORDER_STATUS_COLOR = {
  待确认: '#faad14',
  已接单: '#1890ff',
  服务中: '#13c2c2',
  异常待处理: '#ff4d4f',
  已完成: '#52c41a',
  已取消: '#999',
}

export const CONTRACT_STATUS_COLOR = {
  待签署: '#faad14',
  需求方已签: '#1890ff',
  服务商已签: '#1890ff',
  已签署: '#52c41a',
  已拒签: '#ff4d4f',
  已作废: '#999'
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

export const INTERVENTION_STATUS_COLOR = {
  待处理: '#ff4d4f',
  处理中: '#faad14',
  已处理: '#52c41a',
  已关闭: '#999'
}

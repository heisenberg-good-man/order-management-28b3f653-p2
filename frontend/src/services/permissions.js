import { ROLES, AUTH_STATUS, ORDER_STATUS, CONTRACT_STATUS, PAYMENT_STATUS } from '../store/localStore.js'

export function canPublishDemand(role) {
  return role === ROLES.USER || role === ROLES.ADMIN
}

export function canCreateOrder(role) {
  return role === ROLES.USER || role === ROLES.ADMIN
}

export function canAcceptOrder(role) {
  return role === ROLES.PROVIDER
}

export function canStartService(role) {
  return role === ROLES.PROVIDER
}

export function canCompleteService(role) {
  return role === ROLES.PROVIDER
}

export function canCancelOrder(role) {
  return true
}

export function canEscalateException(role) {
  return role === ROLES.PROVIDER || role === ROLES.ADMIN
}

export function canResolveException(role) {
  return role === ROLES.ADMIN
}

export function canSubmitAuth(role) {
  return role === ROLES.PROVIDER
}

export function canReviewAuth(role) {
  return role === ROLES.ADMIN
}

export function canRegisterProvider(role) {
  return role === ROLES.PROVIDER || role === ROLES.ADMIN
}

export function canEditProvider(role) {
  return role === ROLES.PROVIDER || role === ROLES.ADMIN
}

export function canSignContract(role) {
  return role === ROLES.USER || role === ROLES.PROVIDER
}

export function canRejectContract(role) {
  return role === ROLES.USER || role === ROLES.PROVIDER
}

export function canVoidContract(role) {
  return role === ROLES.ADMIN
}

export function canEditContract(role, contract) {
  if (!contract) return false
  if (role === ROLES.ADMIN) return true
  if (contract.status === CONTRACT_STATUS.SIGNED || contract.status === CONTRACT_STATUS.VOID) return false
  return role === ROLES.USER || role === ROLES.PROVIDER
}

export function canEscrowPayment(role) {
  return role === ROLES.USER
}

export function canConfirmServiceComplete(role) {
  return role === ROLES.USER
}

export function canApplyRefund(role) {
  return role === ROLES.USER
}

export function canSettlePayment(role) {
  return role === ROLES.ADMIN
}

export function canProcessRefund(role) {
  return role === ROLES.ADMIN
}

export function canViewSettleInfo(role) {
  return role === ROLES.PROVIDER || role === ROLES.ADMIN
}

export function canCreateIntervention(role) {
  return role === ROLES.USER || role === ROLES.PROVIDER
}

export function canProcessIntervention(role) {
  return role === ROLES.ADMIN
}

export function isProviderCertified(provider) {
  return provider && provider.auth && provider.auth.status === AUTH_STATUS.APPROVED
}

export function getPermissionDeniedMessage(action) {
  const map = {
    publish_demand: '当前角色无法发布需求，请切换到用户端',
    create_order: '当前角色无法下单，请切换到用户端',
    accept_order: '当前角色无法接单，请切换到服务商端',
    start_service: '当前角色无法开始服务，请切换到服务商端',
    complete_service: '当前角色无法完成服务，请切换到服务商端',
    escalate_exception: '当前角色无法标记异常，请切换到服务商端或管理端',
    resolve_exception: '当前角色无法处理异常，请切换到平台管理端',
    submit_auth: '当前角色无法提交认证，请切换到服务商端',
    review_auth: '当前角色无法审核认证，请切换到平台管理端',
    register_provider: '当前角色无法入驻，请切换到服务商端',
    sign_contract: '当前角色无法签署合同，请切换到用户端或服务商端',
    reject_contract: '当前角色无法拒签合同，请切换到用户端或服务商端',
    void_contract: '当前角色无法作废合同，请切换到平台管理端',
    escrow_payment: '当前角色无法发起托管付款，请切换到用户端',
    confirm_service: '当前角色无法确认服务完成，请切换到用户端',
    apply_refund: '当前角色无法申请退款，请切换到用户端',
    settle_payment: '当前角色无法结算付款，请切换到平台管理端',
    process_refund: '当前角色无法处理退款，请切换到平台管理端',
    create_intervention: '当前角色无法发起平台介入，请切换到用户端或服务商端',
    process_intervention: '当前角色无法处理平台介入，请切换到平台管理端',
  }
  return map[action] || '当前角色无权限执行此操作'
}

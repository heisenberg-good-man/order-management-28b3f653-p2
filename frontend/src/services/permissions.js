import { ROLES, AUTH_STATUS, ORDER_STATUS } from '../store/localStore.js'

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
  }
  return map[action] || '当前角色无权限执行此操作'
}

import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { store, ORDER_STATUS, ROLES, ROLE_LABELS, AUTH_STATUS } from '../store/localStore.js'
import { OrderStatusTag } from '../components/StatusTags.jsx'
import OrderTimeline from '../components/OrderTimeline.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { canAcceptOrder, canStartService, canCompleteService, canEscalateException, canResolveException, canCancelOrder, getPermissionDeniedMessage } from '../services/permissions.js'

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [, force] = React.useReducer((x) => x + 1, 0)
  React.useEffect(() => store.subscribe(() => force()), [])
  const order = store.getOrder(id)
  const provider = order ? store.getProvider(order.provider_id) : null
  const state = store.getState()
  const records = order ? store.getOrderRecords(order.id) : []

  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelError, setCancelError] = useState('')
  const [loading, setLoading] = useState('')

  const [exceptionOpen, setExceptionOpen] = useState(false)
  const [exceptionRemark, setExceptionRemark] = useState('')
  const [exceptionError, setExceptionError] = useState('')

  const [resolveOpen, setResolveOpen] = useState(false)
  const [resolveRemark, setResolveRemark] = useState('')
  const [resolveError, setResolveError] = useState('')

  if (!order) {
    return (
      <div className="page-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
        <h3 style={{ marginBottom: 8 }}>未找到该订单</h3>
        <p style={{ color: '#999', marginBottom: 20 }}>订单 ID 可能有误。</p>
        <div className="btn-group" style={{ justifyContent: 'center' }}>
          <Link to="/orders" className="btn btn-primary">返回订单列表</Link>
        </div>
      </div>
    )
  }

  const role = state.currentRole
  const providerCertified = provider && provider.auth.status === AUTH_STATUS.APPROVED

  const doAction = (action) => {
    if (action === 'accept' && !canAcceptOrder(role)) {
      toast.error(getPermissionDeniedMessage('accept_order')); return
    }
    if (action === 'start' && !canStartService(role)) {
      toast.error(getPermissionDeniedMessage('start_service')); return
    }
    if (action === 'complete' && !canCompleteService(role)) {
      toast.error(getPermissionDeniedMessage('complete_service')); return
    }
    if (action === 'accept' && !providerCertified) {
      toast.error('未通过实名认证的服务商不能接单，请先完成认证'); return
    }
    setLoading(action)
    let r
    if (action === 'accept') r = store.acceptOrder(order.id)
    else if (action === 'start') r = store.startOrder(order.id)
    else if (action === 'complete') r = store.completeOrder(order.id)
    setLoading('')
    if (r.error) toast.error(r.error); else toast.success('操作成功')
  }

  const confirmCancel = () => {
    if (!cancelReason.trim()) { setCancelError('请填写取消原因'); return }
    const r = store.cancelOrder(order.id, cancelReason.trim())
    if (r.error) { toast.error(r.error); return }
    toast.success('订单已取消')
    setCancelOpen(false)
  }

  const confirmException = () => {
    if (!exceptionRemark.trim()) { setExceptionError('请填写异常处理备注'); return }
    const r = store.escalateOrder(order.id, exceptionRemark.trim())
    if (r.error) { toast.error(r.error); return }
    toast.success('已标记为异常待处理')
    setExceptionOpen(false)
  }

  const confirmResolve = () => {
    if (!resolveRemark.trim()) { setResolveError('请填写异常处理备注'); return }
    const r = store.resolveOrder(order.id, resolveRemark.trim())
    if (r.error) { toast.error(r.error); return }
    toast.success('异常已处理，订单恢复服务中')
    setResolveOpen(false)
  }

  const canCancel = [ORDER_STATUS.PENDING_CONFIRM, ORDER_STATUS.ACCEPTED, ORDER_STATUS.IN_SERVICE, ORDER_STATUS.EXCEPTION].includes(order.status)
  const canEscalate = order.status === ORDER_STATUS.IN_SERVICE && canEscalateException(role)
  const canResolve = order.status === ORDER_STATUS.EXCEPTION && canResolveException(role)
  const showAccept = order.status === ORDER_STATUS.PENDING_CONFIRM && canAcceptOrder(role)
  const showStart = order.status === ORDER_STATUS.ACCEPTED && canStartService(role)
  const showComplete = order.status === ORDER_STATUS.IN_SERVICE && canCompleteService(role)

  return (
    <div>
      <div className="page-card" style={{ marginBottom: 16 }}>
        <div className="page-title">
          <span>订单详情</span>
          <div className="btn-group">
            <Link to="/orders" className="btn btn-default">返回订单列表</Link>
            {canCancel && canCancelOrder(role) && (
              <button className="btn btn-danger" onClick={() => { setCancelOpen(true); setCancelReason(''); setCancelError('') }}>
                取消订单
              </button>
            )}
            {canEscalate && (
              <button className="btn btn-danger" onClick={() => { setExceptionOpen(true); setExceptionRemark(''); setExceptionError('') }}>
                标记异常
              </button>
            )}
            {canResolve && (
              <button className="btn btn-primary" onClick={() => { setResolveOpen(true); setResolveRemark(''); setResolveError('') }}>
                处理异常
              </button>
            )}
            {showAccept && (
              <button className="btn btn-success" onClick={() => doAction('accept')} disabled={loading === 'accept'}>
                {loading === 'accept' ? '...' : '接单'}
              </button>
            )}
            {order.status === ORDER_STATUS.PENDING_CONFIRM && canAcceptOrder(role) && !providerCertified && (
              <span style={{ color: '#ff4d4f', fontSize: 12, alignSelf: 'center' }}>⚠️ 未通过实名认证，无法接单</span>
            )}
            {showStart && (
              <button className="btn btn-primary" onClick={() => doAction('start')} disabled={loading === 'start'}>
                {loading === 'start' ? '...' : '开始服务'}
              </button>
            )}
            {showComplete && (
              <button className="btn btn-success" onClick={() => doAction('complete')} disabled={loading === 'complete'}>
                {loading === 'complete' ? '...' : '完成服务'}
              </button>
            )}
          </div>
        </div>

        {order.status === ORDER_STATUS.PENDING_CONFIRM && !canAcceptOrder(role) && role !== ROLES.USER && (
          <div className="permission-denied">
            💡 当前视角为{ROLE_LABELS[role]}，接单操作需切换到服务商端
          </div>
        )}

        <div className="detail-row"><span className="label">订单号</span><span className="value">{order.id}</span></div>
        <div className="detail-row"><span className="label">订单状态</span><span className="value"><OrderStatusTag status={order.status} /></span></div>
        <div className="detail-row"><span className="label">服务商</span>
          <span className="value">
            <Link to={`/providers/${order.provider_id}`} style={{ color: '#667eea' }}>{order.provider_name}</Link>
            {provider && <span style={{ marginLeft: 8, color: '#999', fontSize: 12 }}>（{provider.profession_type} · {provider.service_area}）</span>}
            {provider && provider.auth.status !== AUTH_STATUS.APPROVED && (
              <span style={{ marginLeft: 8, color: '#ff4d4f', fontSize: 12 }}>未认证</span>
            )}
          </span>
        </div>
        <div className="detail-row"><span className="label">客户名称</span><span className="value">{order.user_name}</span></div>
        <div className="detail-row"><span className="label">职业类型</span><span className="value">{order.profession_type}</span></div>
        <div className="detail-row"><span className="label">服务地点</span><span className="value">{order.location}</span></div>
        <div className="detail-row"><span className="label">预算金额</span><span className="value">¥{order.budget}</span></div>
        <div className="detail-row"><span className="label">期望服务时间</span><span className="value">{order.expected_time}</span></div>
        {order.remark && <div className="detail-row"><span className="label">备注</span><span className="value">{order.remark}</span></div>}
        {order.cancel_reason && (
          <div className="detail-row"><span className="label">取消原因</span><span className="value" style={{ color: '#ff4d4f' }}>{order.cancel_reason}</span></div>
        )}
        {order.exception_remark && (
          <div className="detail-row"><span className="label">异常备注</span><span className="value" style={{ color: '#ff4d4f' }}>{order.exception_remark}</span></div>
        )}
      </div>

      <div className="page-card">
        <OrderTimeline order={order} records={records} />
      </div>

      {cancelOpen && (
        <div className="modal-overlay" onClick={() => setCancelOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">取消订单</div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>取消原因</label>
                <textarea className={`form-textarea ${cancelError ? 'error' : ''}`} rows={4} placeholder="请填写取消订单的原因" value={cancelReason} onChange={e => { setCancelReason(e.target.value); if (cancelError) setCancelError('') }} />
                {cancelError && <div className="form-error">{cancelError}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setCancelOpen(false)}>取消</button>
              <button className="btn btn-danger" onClick={confirmCancel}>确认取消</button>
            </div>
          </div>
        </div>
      )}

      {exceptionOpen && (
        <div className="modal-overlay" onClick={() => setExceptionOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">标记订单异常</div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>异常处理备注</label>
                <textarea className={`form-textarea ${exceptionError ? 'error' : ''}`} rows={4} placeholder="请描述异常情况，平台将介入处理" value={exceptionRemark} onChange={e => { setExceptionRemark(e.target.value); if (exceptionError) setExceptionError('') }} />
                {exceptionError && <div className="form-error">{exceptionError}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setExceptionOpen(false)}>取消</button>
              <button className="btn btn-danger" onClick={confirmException}>确认标记异常</button>
            </div>
          </div>
        </div>
      )}

      {resolveOpen && (
        <div className="modal-overlay" onClick={() => setResolveOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">处理异常，恢复服务</div>
            <div className="modal-body">
              <div style={{ marginBottom: 12, color: '#ff4d4f', fontSize: 13 }}>
                异常备注：{order.exception_remark}
              </div>
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>处理说明</label>
                <textarea className={`form-textarea ${resolveError ? 'error' : ''}`} rows={4} placeholder="请填写异常处理结果和恢复服务的说明" value={resolveRemark} onChange={e => { setResolveRemark(e.target.value); if (resolveError) setResolveError('') }} />
                {resolveError && <div className="form-error">{resolveError}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setResolveOpen(false)}>取消</button>
              <button className="btn btn-primary" onClick={confirmResolve}>确认恢复服务</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

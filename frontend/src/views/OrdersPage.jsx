import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { store, ORDER_STATUS, ROLES, ROLE_LABELS, AUTH_STATUS } from '../store/localStore.js'
import EmptyState from '../components/EmptyState.jsx'
import { OrderStatusTag } from '../components/StatusTags.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { canAcceptOrder, canStartService, canCompleteService, canEscalateException, canResolveException, canCancelOrder } from '../services/permissions.js'

export default function OrdersPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [, force] = React.useReducer((x) => x + 1, 0)
  React.useEffect(() => store.subscribe(() => force()), [])
  const state = store.getState()

  const [fStatus, setFStatus] = useState('')
  const [view, setView] = useState(state.currentRole === ROLES.PROVIDER ? 'provider' : state.currentRole === ROLES.ADMIN ? 'admin' : 'user')
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelId, setCancelId] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [cancelError, setCancelError] = useState('')
  const [actionLoading, setActionLoading] = useState('')

  const [exceptionOpen, setExceptionOpen] = useState(false)
  const [exceptionId, setExceptionId] = useState('')
  const [exceptionRemark, setExceptionRemark] = useState('')
  const [exceptionError, setExceptionError] = useState('')

  const [resolveOpen, setResolveOpen] = useState(false)
  const [resolveId, setResolveId] = useState('')
  const [resolveRemark, setResolveRemark] = useState('')
  const [resolveError, setResolveError] = useState('')

  const filter = { status: fStatus || undefined }
  if (view === 'user') filter.user_id = state.currentUserId
  if (view === 'provider') filter.provider_id = state.currentProviderId
  let orders = store.listOrders(view === 'admin' ? { status: fStatus || undefined } : filter)
  const role = state.currentRole

  const doAction = (id, action) => {
    if (action === 'accept' && !canAcceptOrder(role)) {
      toast.error('当前角色无法接单，请切换到服务商端'); return
    }
    if (action === 'start' && !canStartService(role)) {
      toast.error('当前角色无法开始服务，请切换到服务商端'); return
    }
    if (action === 'complete' && !canCompleteService(role)) {
      toast.error('当前角色无法完成服务，请切换到服务商端'); return
    }
    setActionLoading(`${id}-${action}`)
    let r
    if (action === 'accept') r = store.acceptOrder(id)
    else if (action === 'start') r = store.startOrder(id)
    else if (action === 'complete') r = store.completeOrder(id)
    setActionLoading('')
    if (r.error) toast.error(r.error); else toast.success('操作成功')
  }

  const openCancel = (id) => { setCancelId(id); setCancelReason(''); setCancelError(''); setCancelOpen(true) }
  const openException = (id) => { setExceptionId(id); setExceptionRemark(''); setExceptionError(''); setExceptionOpen(true) }
  const openResolve = (id) => { setResolveId(id); setResolveRemark(''); setResolveError(''); setResolveOpen(true) }

  const confirmCancel = () => {
    if (!cancelReason.trim()) { setCancelError('请填写取消原因'); return }
    const r = store.cancelOrder(cancelId, cancelReason.trim())
    if (r.error) { toast.error(r.error); return }
    toast.success('订单已取消')
    setCancelOpen(false)
  }

  const confirmException = () => {
    if (!exceptionRemark.trim()) { setExceptionError('请填写异常处理备注'); return }
    const r = store.escalateOrder(exceptionId, exceptionRemark.trim())
    if (r.error) { toast.error(r.error); return }
    toast.success('已标记为异常待处理')
    setExceptionOpen(false)
  }

  const confirmResolve = () => {
    if (!resolveRemark.trim()) { setResolveError('请填写异常处理备注'); return }
    const r = store.resolveOrder(resolveId, resolveRemark.trim())
    if (r.error) { toast.error(r.error); return }
    toast.success('异常已处理，订单恢复服务中')
    setResolveOpen(false)
  }

  return (
    <div>
      <div className="page-card">
        <div className="page-title">
          <span>📦 订单管理（共 {orders.length} 单）</span>
        </div>
        <div className="filter-bar">
          <div className="filter-item"><label>查看视角：</label>
            <select className="form-select" style={{ width: 160 }} value={view} onChange={e => setView(e.target.value)}>
              <option value="user">我下的单（用户端）</option>
              <option value="provider">我接的单（服务商端）</option>
              <option value="admin">全部订单（管理端）</option>
            </select>
          </div>
          <div className="filter-item"><label>状态：</label>
            <select className="form-select" style={{ width: 140 }} value={fStatus} onChange={e => setFStatus(e.target.value)}>
              <option value="">全部</option>
              {Object.values(ORDER_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {view === 'provider' && !state.currentProviderId && (
          <div style={{ padding: 16, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 4, marginBottom: 16 }}>
            <span style={{ color: '#faad14' }}>⚠️</span> 尚未选择当前服务商，
            <a href="#/providers" onClick={e => { e.preventDefault(); navigate('/providers') }} style={{ color: '#667eea', margin: '0 4px' }}>去服务商列表</a>
            选择一个服务商后再查看其订单。
          </div>
        )}

        {orders.length === 0 ? (
          <EmptyState text="暂无订单，快去发布需求并撮合下单吧" />
        ) : (
          <div className="order-list">
            {orders.map(o => {
              const p = store.getProvider(o.provider_id)
              const providerCertified = p && p.auth.status === AUTH_STATUS.APPROVED
              return (
                <div key={o.id} className="order-card">
                  <div className="order-header">
                    <div>
                      <strong style={{ fontSize: 15 }}>{o.profession_type}</strong>
                      <span style={{ color: '#999', fontSize: 13, marginLeft: 12 }}>
                        {view === 'provider' ? `客户：${o.user_name}` : `服务商：${o.provider_name}`}
                      </span>
                      <span className="order-id" style={{ marginLeft: 12 }}>{o.id}</span>
                    </div>
                    <OrderStatusTag status={o.status} />
                  </div>
                  <div className="order-body">
                    <div><span className="label">服务地点：</span>{o.location}</div>
                    <div><span className="label">预算：</span>¥{o.budget}</div>
                    <div><span className="label">期望时间：</span>{o.expected_time}</div>
                    <div><span className="label">创建：</span>{o.created_at}</div>
                    {o.remark && <div style={{ gridColumn: '1 / -1' }}><span className="label">备注：</span>{o.remark}</div>}
                    {o.cancel_reason && (
                      <div style={{ gridColumn: '1 / -1', color: '#ff4d4f' }}>
                        <span className="label" style={{ color: '#ff4d4f' }}>取消原因：</span>{o.cancel_reason}
                      </div>
                    )}
                    {o.exception_remark && (
                      <div style={{ gridColumn: '1 / -1', color: '#ff4d4f' }}>
                        <span className="label" style={{ color: '#ff4d4f' }}>异常备注：</span>{o.exception_remark}
                      </div>
                    )}
                  </div>
                  <div className="order-footer">
                    <button className="btn btn-default btn-sm" onClick={() => navigate(`/orders/${o.id}`)}>查看详情</button>
                    {o.status === ORDER_STATUS.PENDING_CONFIRM && canAcceptOrder(role) && (
                      providerCertified ? (
                        <button className="btn btn-success btn-sm" disabled={actionLoading === `${o.id}-accept`} onClick={() => doAction(o.id, 'accept')}>
                          {actionLoading === `${o.id}-accept` ? '...' : '接单'}
                        </button>
                      ) : (
                        <span style={{ color: '#ff4d4f', fontSize: 12, alignSelf: 'center' }}>⚠️ 未认证不能接单</span>
                      )
                    )}
                    {o.status === ORDER_STATUS.ACCEPTED && canStartService(role) && (
                      <button className="btn btn-primary btn-sm" disabled={actionLoading === `${o.id}-start`} onClick={() => doAction(o.id, 'start')}>
                        {actionLoading === `${o.id}-start` ? '...' : '开始服务'}
                      </button>
                    )}
                    {o.status === ORDER_STATUS.IN_SERVICE && canCompleteService(role) && (
                      <button className="btn btn-success btn-sm" disabled={actionLoading === `${o.id}-complete`} onClick={() => doAction(o.id, 'complete')}>
                        {actionLoading === `${o.id}-complete` ? '...' : '完成服务'}
                      </button>
                    )}
                    {o.status === ORDER_STATUS.IN_SERVICE && canEscalateException(role) && (
                      <button className="btn btn-danger btn-sm" onClick={() => openException(o.id)}>标记异常</button>
                    )}
                    {o.status === ORDER_STATUS.EXCEPTION && canResolveException(role) && (
                      <button className="btn btn-primary btn-sm" onClick={() => openResolve(o.id)}>处理异常</button>
                    )}
                    {[ORDER_STATUS.PENDING_CONFIRM, ORDER_STATUS.ACCEPTED, ORDER_STATUS.IN_SERVICE, ORDER_STATUS.EXCEPTION].includes(o.status) && canCancelOrder(role) && (
                      <button className="btn btn-danger btn-sm" onClick={() => openCancel(o.id)}>取消订单</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
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
                <textarea className={`form-textarea ${exceptionError ? 'error' : ''}`} rows={4} placeholder="请描述异常情况" value={exceptionRemark} onChange={e => { setExceptionRemark(e.target.value); if (exceptionError) setExceptionError('') }} />
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

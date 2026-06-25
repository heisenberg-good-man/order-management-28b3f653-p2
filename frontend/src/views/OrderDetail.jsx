import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { store, ORDER_STATUS } from '../store/localStore.js'
import { OrderStatusTag } from '../components/StatusTags.jsx'
import OrderTimeline from '../components/OrderTimeline.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [, force] = React.useReducer((x) => x + 1, 0)
  React.useEffect(() => store.subscribe(() => force()), [])
  const order = store.getOrder(id)
  const provider = order ? store.getProvider(order.provider_id) : null

  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelError, setCancelError] = useState('')
  const [loading, setLoading] = useState('')

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

  const doAction = (action) => {
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

  const canCancel = [ORDER_STATUS.PENDING_CONFIRM, ORDER_STATUS.ACCEPTED, ORDER_STATUS.IN_SERVICE].includes(order.status)

  return (
    <div>
      <div className="page-card" style={{ marginBottom: 16 }}>
        <div className="page-title">
          <span>订单详情</span>
          <div className="btn-group">
            <Link to="/orders" className="btn btn-default">返回订单列表</Link>
            {canCancel && (
              <button className="btn btn-danger" onClick={() => { setCancelOpen(true); setCancelReason(''); setCancelError('') }}>
                取消订单
              </button>
            )}
            {order.status === ORDER_STATUS.PENDING_CONFIRM && (
              <button className="btn btn-success" onClick={() => doAction('accept')} disabled={loading === 'accept'}>
                {loading === 'accept' ? '...' : '接单'}
              </button>
            )}
            {order.status === ORDER_STATUS.ACCEPTED && (
              <button className="btn btn-primary" onClick={() => doAction('start')} disabled={loading === 'start'}>
                {loading === 'start' ? '...' : '开始服务'}
              </button>
            )}
            {order.status === ORDER_STATUS.IN_SERVICE && (
              <button className="btn btn-success" onClick={() => doAction('complete')} disabled={loading === 'complete'}>
                {loading === 'complete' ? '...' : '完成服务'}
              </button>
            )}
          </div>
        </div>
        <div className="detail-row"><span className="label">订单号</span><span className="value">{order.id}</span></div>
        <div className="detail-row"><span className="label">订单状态</span><span className="value"><OrderStatusTag status={order.status} /></span></div>
        <div className="detail-row"><span className="label">服务商</span>
          <span className="value">
            <Link to={`/providers/${order.provider_id}`} style={{ color: '#667eea' }}>{order.provider_name}</Link>
            {provider && <span style={{ marginLeft: 8, color: '#999', fontSize: 12 }}>（{provider.profession_type} · {provider.service_area}）</span>}
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
      </div>

      <div className="page-card">
        <OrderTimeline order={order} />
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
    </div>
  )
}

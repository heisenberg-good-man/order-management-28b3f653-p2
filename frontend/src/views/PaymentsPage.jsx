import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { store, ROLES, PAYMENT_STATUS } from '../store/localStore.js'
import { PaymentStatusTag, OrderStatusTag } from '../components/StatusTags.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { canEscrowPayment, canConfirmServiceComplete, canApplyRefund, canSettlePayment, canProcessRefund, canViewSettleInfo, getPermissionDeniedMessage } from '../services/permissions.js'
import EmptyState from '../components/EmptyState.jsx'

export default function PaymentsPage() {
  const [, force] = React.useReducer((x) => x + 1, 0)
  React.useEffect(() => store.subscribe(() => force()), [])
  const toast = useToast()
  const state = store.getState()
  const role = state.currentRole
  const stats = store.stats()

  const [statusFilter, setStatusFilter] = useState('')
  const [keyword, setKeyword] = useState('')

  const [detailId, setDetailId] = useState('')
  const [escrowOpen, setEscrowOpen] = useState(false)
  const [escrowAmount, setEscrowAmount] = useState('')
  const [escrowError, setEscrowError] = useState('')
  const [refundOpen, setRefundOpen] = useState(false)
  const [refundReason, setRefundReason] = useState('')
  const [refundError, setRefundError] = useState('')
  const [processRefundOpen, setProcessRefundOpen] = useState(false)
  const [processRefundType, setProcessRefundType] = useState('')
  const [processRefundAmount, setProcessRefundAmount] = useState('')
  const [processRefundRemark, setProcessRefundRemark] = useState('')
  const [processRefundError, setProcessRefundError] = useState('')

  let filter = {}
  if (role === ROLES.USER) filter.user_id = state.currentUserId
  if (role === ROLES.PROVIDER) filter.provider_id = state.currentProviderId
  if (statusFilter) filter.status = statusFilter

  let list = store.listPayments(filter)
  if (keyword.trim()) {
    const kw = keyword.trim().toLowerCase()
    list = list.filter(p =>
      p.order_no.toLowerCase().includes(kw) ||
      p.user_name.toLowerCase().includes(kw) ||
      p.provider_name.toLowerCase().includes(kw)
    )
  }

  const detailPayment = detailId ? store.getPayment(detailId) : null
  const detailOrder = detailPayment ? store.getOrder(detailPayment.order_id) : null

  const openDetail = (p) => { setDetailId(p.id); setEscrowAmount(String(p.amount)); setEscrowError('') }

  const openEscrow = () => {
    if (!canEscrowPayment(role)) { toast.error(getPermissionDeniedMessage('escrow_payment')); return }
    setEscrowOpen(true); setEscrowAmount(String(detailPayment.amount)); setEscrowError('')
  }
  const confirmEscrow = () => {
    if (!escrowAmount || Number(escrowAmount) <= 0) { setEscrowError('托管金额不合法'); return }
    const r = store.escrowPayment(detailPayment.order_id, Number(escrowAmount))
    if (r.error) { toast.error(r.error); return }
    toast.success('托管付款成功')
    setEscrowOpen(false)
  }

  const doConfirmComplete = () => {
    if (!canConfirmServiceComplete(role)) { toast.error(getPermissionDeniedMessage('confirm_service')); return }
    const r = store.confirmServiceComplete(detailPayment.order_id)
    if (r.error) { toast.error(r.error); return }
    toast.success('已确认服务完成，等待平台结算')
  }

  const openRefund = () => {
    if (!canApplyRefund(role)) { toast.error(getPermissionDeniedMessage('apply_refund')); return }
    setRefundOpen(true); setRefundReason(''); setRefundError('')
  }
  const confirmRefund = () => {
    if (!refundReason.trim()) { setRefundError('退款原因不能为空'); return }
    const r = store.applyRefund(detailPayment.order_id, refundReason.trim())
    if (r.error) { toast.error(r.error); return }
    toast.success('退款申请已提交，等待平台处理')
    setRefundOpen(false)
  }

  const doSettle = () => {
    if (!canSettlePayment(role)) { toast.error(getPermissionDeniedMessage('settle_payment')); return }
    const r = store.settlePayment(detailPayment.order_id)
    if (r.error) { toast.error(r.error); return }
    toast.success('结算成功')
  }

  const openProcessRefund = () => {
    if (!canProcessRefund(role)) { toast.error(getPermissionDeniedMessage('process_refund')); return }
    setProcessRefundOpen(true); setProcessRefundType(''); setProcessRefundAmount(''); setProcessRefundRemark(''); setProcessRefundError('')
  }
  const confirmProcessRefund = () => {
    if (!processRefundType) { setProcessRefundError('请选择退款类型'); return }
    if (processRefundType === 'partial' && (!processRefundAmount || Number(processRefundAmount) <= 0)) { setProcessRefundError('请填写有效的退款金额'); return }
    if (!processRefundRemark.trim()) { setProcessRefundError('请填写处理说明'); return }
    const r = store.processRefund(detailPayment.order_id, processRefundType, Number(processRefundAmount) || 0)
    if (r.error) { toast.error(r.error); return }
    toast.success('退款处理完成')
    setProcessRefundOpen(false)
  }

  const canEscrow = detailPayment && canEscrowPayment(role) && detailPayment.status === PAYMENT_STATUS.PENDING_ESCROW
  const canConfirm = detailPayment && canConfirmServiceComplete(role) && detailPayment.status === PAYMENT_STATUS.IN_SERVICE_CONFIRMABLE
  const canApplyRefund = detailPayment && canApplyRefund(role) && [PAYMENT_STATUS.ESCROWED, PAYMENT_STATUS.IN_SERVICE_CONFIRMABLE, PAYMENT_STATUS.PENDING_SETTLE].includes(detailPayment.status)
  const canSettle = detailPayment && canSettlePayment(role) && detailPayment.status === PAYMENT_STATUS.PENDING_SETTLE
  const canProcessRefund = detailPayment && canProcessRefund(role) && detailPayment.status === PAYMENT_STATUS.REFUND_PROCESSING

  return (
    <div>
      <div className="page-card" style={{ marginBottom: 16 }}>
        <div className="page-title">
          <span>担保付款管理</span>
          <div style={{ fontSize: 13, color: '#999' }}>当前视角：{role === ROLES.USER ? '需求方' : role === ROLES.PROVIDER ? '服务商' : '平台管理端'}</div>
        </div>
        <div className="stats-grid">
          <div className="stat-card warning"><div className="stat-label">待托管</div><div className="stat-value">{stats.pending_escrow_payments} 笔</div></div>
          <div className="stat-card primary"><div className="stat-label">托管中金额</div><div className="stat-value">¥{stats.escrowed_amount.toLocaleString()}</div></div>
          <div className="stat-card" style={{ borderColor: '#722ed1' }}><div className="stat-label" style={{ color: '#722ed1' }}>待结算金额</div><div className="stat-value" style={{ color: '#722ed1' }}>¥{stats.pending_settle_amount.toLocaleString()}</div></div>
          <div className="stat-card danger"><div className="stat-label">退款处理中</div><div className="stat-value">{stats.paymentStats['退款处理中'] || 0} 笔</div></div>
        </div>

        <div className="filter-bar">
          <div className="filter-item">
            <label>状态：</label>
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 160 }}>
              <option value="">全部</option>
              {Object.values(PAYMENT_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-item" style={{ flex: 1 }}>
            <label>搜索：</label>
            <input className="form-input" placeholder="输入订单号/需求方/服务商" value={keyword} onChange={e => setKeyword(e.target.value)} style={{ maxWidth: 360 }} />
          </div>
        </div>

        {list.length === 0 ? (
          <EmptyState text={keyword || statusFilter ? '没有符合条件的付款记录' : '暂无付款数据'} />
        ) : (
          <div className="order-list">
            {list.map(p => (
              <div key={p.id} className="order-card" onClick={() => openDetail(p)} style={{ cursor: 'pointer' }}>
                <div className="order-header">
                  <div>
                    <span className="order-id">付款单号：{p.id}</span>
                    <span style={{ marginLeft: 12 }}>订单：<Link to={`/orders/${p.order_id}`} onClick={e => e.stopPropagation()} style={{ color: '#667eea' }}>{p.order_no}</Link></span>
                  </div>
                  <PaymentStatusTag status={p.status} />
                </div>
                <div className="order-body">
                  <div><span className="label">订单金额：</span><span style={{ color: '#fa8c16', fontWeight: 600 }}>¥{p.amount.toLocaleString()}</span></div>
                  <div><span className="label">已托管：</span>¥{(p.escrow_amount || 0).toLocaleString()}</div>
                  <div><span className="label">需求方：</span>{p.user_name}</div>
                  <div><span className="label">服务商：</span>{p.provider_name}</div>
                  {canViewSettleInfo(role) && <div><span className="label">待结算：</span><span style={{ color: '#722ed1' }}>¥{(p.status === PAYMENT_STATUS.PENDING_SETTLE ? p.escrow_amount : 0).toLocaleString()}</span></div>}
                  {canViewSettleInfo(role) && <div><span className="label">已结算：</span><span style={{ color: '#52c41a' }}>¥{(p.settled_amount || 0).toLocaleString()}</span></div>}
                  {p.refund_amount > 0 && <div><span className="label">退款：</span><span style={{ color: '#ff4d4f' }}>¥{(p.refund_amount || 0).toLocaleString()}</span></div>}
                </div>
                <div className="order-footer">
                  <span style={{ color: '#999', fontSize: 12 }}>创建于 {p.created_at}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {detailPayment && (
        <div className="modal-overlay" onClick={() => setDetailId('')}>
          <div className="modal" style={{ width: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>担保付款详情</span>
              <PaymentStatusTag status={detailPayment.status} />
            </div>
            <div className="modal-body">
              <div className="payment-steps">
                {['待托管', '已托管', '服务中可确认', '待结算', '已结算'].map((step, idx) => {
                  const stepIdx = ['待托管', '已托管', '服务中可确认', '待结算', '已结算'].indexOf(detailPayment.status)
                  const isDone = idx <= stepIdx && detailPayment.status !== '退款处理中' && detailPayment.status !== '已退款'
                  const isRefund = (detailPayment.status === '退款处理中' || detailPayment.status === '已退款') && idx === stepIdx
                  return (
                    <div key={step} className={`payment-step ${isDone ? 'done' : ''} ${isRefund ? 'exception' : ''}`}>
                      <div className="payment-step-dot" />
                      <div className="payment-step-label">{step}</div>
                    </div>
                  )
                })}
              </div>
              {(detailPayment.status === '退款处理中' || detailPayment.status === '已退款') && (
                <div className="permission-denied" style={{ marginBottom: 16 }}>退款原因：{detailPayment.refund_reason || '（无）'}</div>
              )}
              <div className="detail-row"><span className="label">付款单号</span><span className="value">{detailPayment.id}</span></div>
              <div className="detail-row"><span className="label">关联订单</span><span className="value"><Link to={`/orders/${detailPayment.order_id}`} style={{ color: '#667eea' }}>{detailPayment.order_no}</Link></span></div>
              {detailOrder && <div className="detail-row"><span className="label">订单状态</span><span className="value"><OrderStatusTag status={detailOrder.status} /></span></div>}
              <div className="detail-row"><span className="label">需求方</span><span className="value">{detailPayment.user_name}</span></div>
              <div className="detail-row"><span className="label">服务商</span><span className="value">{detailPayment.provider_name}</span></div>
              <div className="detail-section" style={{ marginTop: 16 }}>
                <div className="detail-section-title">资金明细</div>
                <div className="detail-row"><span className="label">订单金额</span><span className="value" style={{ fontWeight: 600, color: '#333' }}>¥{detailPayment.amount.toLocaleString()}</span></div>
                <div className="detail-row"><span className="label">已托管</span><span className="value" style={{ color: '#1890ff' }}>¥{(detailPayment.escrow_amount || 0).toLocaleString()}{detailPayment.escrowed_at ? `（${detailPayment.escrowed_at}）` : ''}</span></div>
                <div className="detail-row"><span className="label">已结算</span><span className="value" style={{ color: '#52c41a' }}>¥{(detailPayment.settled_amount || 0).toLocaleString()}{detailPayment.settled_at ? `（${detailPayment.settled_at}）` : ''}</span></div>
                <div className="detail-row"><span className="label">已退款</span><span className="value" style={{ color: '#ff4d4f' }}>¥{(detailPayment.refund_amount || 0).toLocaleString()}{detailPayment.refund_at ? `（${detailPayment.refund_at}）` : ''}</span></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setDetailId('')}>关闭</button>
              {canProcessRefund && <button className="btn btn-warning" style={{ background: '#fa8c16', color: '#fff', border: 'none' }} onClick={openProcessRefund}>处理退款</button>}
              {canSettle && <button className="btn btn-success" onClick={doSettle}>结算给服务商</button>}
              {canApplyRefund && <button className="btn btn-danger" onClick={openRefund}>申请退款</button>}
              {canConfirm && <button className="btn btn-primary" onClick={doConfirmComplete}>确认服务完成</button>}
              {canEscrow && <button className="btn btn-primary" onClick={openEscrow}>去托管付款</button>}
            </div>
          </div>
        </div>
      )}

      {escrowOpen && (
        <div className="modal-overlay" onClick={() => setEscrowOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">托管付款</div>
            <div className="modal-body">
              <div style={{ marginBottom: 12, fontSize: 13, color: '#666' }}>订单金额：¥{detailPayment?.amount.toLocaleString()}，请将对应款项托管至平台。</div>
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>托管金额</label>
                <input type="number" className={`form-input ${escrowError ? 'error' : ''}`} value={escrowAmount} onChange={e => { setEscrowAmount(e.target.value); if (escrowError) setEscrowError('') }} placeholder="请输入托管金额" />
                {escrowError && <div className="form-error">{escrowError}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setEscrowOpen(false)}>取消</button>
              <button className="btn btn-primary" onClick={confirmEscrow}>确认托管</button>
            </div>
          </div>
        </div>
      )}

      {refundOpen && (
        <div className="modal-overlay" onClick={() => setRefundOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">申请退款</div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>退款原因</label>
                <textarea className={`form-textarea ${refundError ? 'error' : ''}`} rows={4} placeholder="请详细说明退款原因" value={refundReason} onChange={e => { setRefundReason(e.target.value); if (refundError) setRefundError('') }} />
                {refundError && <div className="form-error">{refundError}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setRefundOpen(false)}>取消</button>
              <button className="btn btn-danger" onClick={confirmRefund}>提交退款申请</button>
            </div>
          </div>
        </div>
      )}

      {processRefundOpen && (
        <div className="modal-overlay" onClick={() => setProcessRefundOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">处理退款</div>
            <div className="modal-body">
              <div style={{ marginBottom: 12, fontSize: 13, color: '#666' }}>
                托管金额：¥{detailPayment?.escrow_amount.toLocaleString()}，申请退款原因：{detailPayment?.refund_reason}
              </div>
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>退款类型</label>
                <select className={`form-select ${processRefundError && !processRefundType ? 'error' : ''}`} value={processRefundType} onChange={e => { setProcessRefundType(e.target.value); if (processRefundError) setProcessRefundError('') }}>
                  <option value="">请选择</option>
                  <option value="full">全额退款</option>
                  <option value="partial">部分退款</option>
                  <option value="reject">驳回退款申请</option>
                </select>
              </div>
              {processRefundType === 'partial' && (
                <div className="form-group">
                  <label className="form-label"><span className="required">*</span>退款金额</label>
                  <input type="number" className={`form-input ${processRefundError && processRefundType === 'partial' ? 'error' : ''}`} value={processRefundAmount} onChange={e => { setProcessRefundAmount(e.target.value); if (processRefundError) setProcessRefundError('') }} placeholder="请输入退款金额（小于托管金额）" />
                </div>
              )}
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>处理说明</label>
                <textarea className={`form-textarea ${processRefundError ? 'error' : ''}`} rows={3} value={processRefundRemark} onChange={e => { setProcessRefundRemark(e.target.value); if (processRefundError) setProcessRefundError('') }} placeholder="请填写处理说明" />
                {processRefundError && <div className="form-error">{processRefundError}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setProcessRefundOpen(false)}>取消</button>
              <button className="btn btn-primary" onClick={confirmProcessRefund}>确认处理</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

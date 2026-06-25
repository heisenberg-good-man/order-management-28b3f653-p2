import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { store, ORDER_STATUS, ROLES, ROLE_LABELS, AUTH_STATUS, CONTRACT_STATUS, PAYMENT_STATUS, INTERVENTION_STATUS, INTERVENTION_RESULT } from '../store/localStore.js'
import { OrderStatusTag, ContractStatusTag, PaymentStatusTag, InterventionStatusTag } from '../components/StatusTags.jsx'
import OrderTimeline from '../components/OrderTimeline.jsx'
import { useToast } from '../context/ToastContext.jsx'
import {
  canAcceptOrder, canStartService, canCompleteService, canEscalateException, canResolveException, canCancelOrder,
  canSignContract, canRejectContract, canVoidContract, canEditContract,
  canEscrowPayment, canConfirmServiceComplete, canApplyRefund, canSettlePayment, canProcessRefund, canViewSettleInfo,
  canCreateIntervention, canProcessIntervention,
  getPermissionDeniedMessage
} from '../services/permissions.js'

const TABS = [
  { key: 'basic', label: '基本信息', icon: '📋' },
  { key: 'contract', label: '合同协议', icon: '📝' },
  { key: 'payment', label: '担保付款', icon: '💰' },
  { key: 'intervention', label: '平台介入', icon: '⚖️' },
  { key: 'timeline', label: '操作记录', icon: '🕐' },
]

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [, force] = React.useReducer((x) => x + 1, 0)
  React.useEffect(() => store.subscribe(() => force()), [])
  const order = store.getOrder(id)
  const provider = order ? store.getProvider(order.provider_id) : null
  const contract = order ? store.getContractByOrder(order.id) : null
  const payment = order ? store.getPaymentByOrder(order.id) : null
  const interventions = order ? store.listInterventions({ order_id: order.id }) : []
  const state = store.getState()
  const records = order ? store.getOrderRecords(order.id) : []

  const [activeTab, setActiveTab] = useState('basic')
  const [loading, setLoading] = useState('')

  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelError, setCancelError] = useState('')

  const [exceptionOpen, setExceptionOpen] = useState(false)
  const [exceptionRemark, setExceptionRemark] = useState('')
  const [exceptionError, setExceptionError] = useState('')

  const [resolveOpen, setResolveOpen] = useState(false)
  const [resolveRemark, setResolveRemark] = useState('')
  const [resolveError, setResolveError] = useState('')

  const [signLoading, setSignLoading] = useState('')
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState('')
  const [voidOpen, setVoidOpen] = useState(false)
  const [voidReason, setVoidReason] = useState('')
  const [voidError, setVoidError] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({ service_commitment: '', breach_terms: '', service_address: '', service_time: '', price: 0 })
  const [editError, setEditError] = useState({})

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

  const [createIvOpen, setCreateIvOpen] = useState(false)
  const [createIvForm, setCreateIvForm] = useState({ reason: '', appeal: '', remark: '' })
  const [createIvError, setCreateIvError] = useState({})
  const [processIvOpen, setProcessIvOpen] = useState(false)
  const [processIvResult, setProcessIvResult] = useState('')
  const [processIvRemark, setProcessIvRemark] = useState('')
  const [processIvError, setProcessIvError] = useState('')
  const [selectedIvId, setSelectedIvId] = useState('')

  if (!order) {
    return (
      <div className="page-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
        <h3 style={{ marginBottom: 8 }}>未找到该订单</h3>
        <p style={{ color: '#999', marginBottom: 20 }}>请先从订单列表选择一个订单查看详情。</p>
        <div className="btn-group" style={{ justifyContent: 'center' }}>
          <Link to="/orders" className="btn btn-primary">前往订单列表</Link>
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
    if (r && r.error) toast.error(r.error); else toast.success('操作成功')
  }

  const confirmCancel = () => {
    if (!cancelReason.trim()) { setCancelError('请填写取消原因'); return }
    const r = store.cancelOrder(order.id, cancelReason.trim())
    if (r && r.error) { toast.error(r.error); return }
    toast.success('订单已取消')
    setCancelOpen(false)
  }

  const confirmException = () => {
    if (!exceptionRemark.trim()) { setExceptionError('请填写异常处理备注'); return }
    const r = store.escalateOrder(order.id, exceptionRemark.trim())
    if (r && r.error) { toast.error(r.error); return }
    toast.success('已标记为异常待处理')
    setExceptionOpen(false)
  }

  const confirmResolve = () => {
    if (!resolveRemark.trim()) { setResolveError('请填写异常处理备注'); return }
    const r = store.resolveOrder(order.id, resolveRemark.trim())
    if (r && r.error) { toast.error(r.error); return }
    toast.success('异常已处理，订单恢复服务中')
    setResolveOpen(false)
  }

  const doSignContract = () => {
    if (!canSignContract(role)) { toast.error(getPermissionDeniedMessage('sign_contract')); return }
    setSignLoading('sign')
    const r = store.signContract(contract.id)
    setSignLoading('')
    if (r && r.error) toast.error(r.error); else toast.success('签署成功')
  }

  const openReject = () => { setRejectOpen(true); setRejectReason(''); setRejectError('') }
  const confirmReject = () => {
    if (!canRejectContract(role)) { toast.error(getPermissionDeniedMessage('reject_contract')); return }
    if (!rejectReason.trim()) { setRejectError('拒签原因不能为空'); return }
    const r = store.rejectContract(contract.id, rejectReason.trim())
    if (r && r.error) { toast.error(r.error); return }
    toast.success('已拒签')
    setRejectOpen(false)
  }

  const openVoid = () => { setVoidOpen(true); setVoidReason(''); setVoidError('') }
  const confirmVoid = () => {
    if (!canVoidContract(role)) { toast.error(getPermissionDeniedMessage('void_contract')); return }
    if (!voidReason.trim()) { setVoidError('作废原因不能为空'); return }
    const r = store.voidContract(contract.id, voidReason.trim())
    if (r && r.error) { toast.error(r.error); return }
    toast.success('合同已作废')
    setVoidOpen(false)
  }

  const openEdit = () => {
    if (!canEditContract(role, contract)) { toast.error('当前状态或角色无法修改合同'); return }
    setEditForm({ service_commitment: contract.service_commitment, breach_terms: contract.breach_terms, service_address: contract.service_address, service_time: contract.service_time, price: contract.price })
    setEditError({})
    setEditOpen(true)
  }
  const confirmEdit = () => {
    const err = {}
    if (!editForm.service_commitment.trim()) err.service_commitment = '服务承诺不能为空'
    if (!editForm.breach_terms.trim()) err.breach_terms = '违约说明不能为空'
    setEditError(err)
    if (Object.keys(err).length) return
    const r = store.updateContract(contract.id, editForm)
    if (r && r.error) { toast.error(r.error); return }
    toast.success('合同已更新')
    setEditOpen(false)
  }

  const openEscrow = () => {
    if (!canEscrowPayment(role)) { toast.error(getPermissionDeniedMessage('escrow_payment')); return }
    setEscrowOpen(true); setEscrowAmount(String(payment.amount)); setEscrowError('')
  }
  const confirmEscrow = () => {
    if (!escrowAmount || Number(escrowAmount) <= 0) { setEscrowError('托管金额不合法'); return }
    const r = store.escrowPayment(order.id, Number(escrowAmount))
    if (r && r.error) { toast.error(r.error); return }
    toast.success('托管付款成功')
    setEscrowOpen(false)
  }

  const doConfirmComplete = () => {
    if (!canConfirmServiceComplete(role)) { toast.error(getPermissionDeniedMessage('confirm_service')); return }
    const r = store.confirmServiceComplete(order.id)
    if (r && r.error) { toast.error(r.error); return }
    toast.success('已确认服务完成，等待平台结算')
  }

  const openRefund = () => {
    if (!canApplyRefund(role)) { toast.error(getPermissionDeniedMessage('apply_refund')); return }
    setRefundOpen(true); setRefundReason(''); setRefundError('')
  }
  const confirmRefund = () => {
    if (!refundReason.trim()) { setRefundError('退款原因不能为空'); return }
    const r = store.applyRefund(order.id, refundReason.trim())
    if (r && r.error) { toast.error(r.error); return }
    toast.success('退款申请已提交')
    setRefundOpen(false)
  }

  const doSettle = () => {
    if (!canSettlePayment(role)) { toast.error(getPermissionDeniedMessage('settle_payment')); return }
    const r = store.settlePayment(order.id)
    if (r && r.error) { toast.error(r.error); return }
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
    const r = store.processRefund(order.id, processRefundType, Number(processRefundAmount) || 0)
    if (r && r.error) { toast.error(r.error); return }
    toast.success('退款处理完成')
    setProcessRefundOpen(false)
  }

  const openCreateIv = () => {
    if (!canCreateIntervention(role)) { toast.error(getPermissionDeniedMessage('create_intervention')); return }
    if ([ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED].includes(order.status)) { toast.error('订单已完成或已取消，不能发起介入申请'); return }
    setCreateIvOpen(true); setCreateIvForm({ reason: '', appeal: '', remark: '' }); setCreateIvError({})
  }
  const confirmCreateIv = () => {
    const err = {}
    if (!createIvForm.reason.trim()) err.reason = '介入原因不能为空'
    if (!createIvForm.appeal.trim()) err.appeal = '诉求内容不能为空'
    setCreateIvError(err)
    if (Object.keys(err).length) return
    const r = store.createIntervention({ order_id: order.id, ...createIvForm })
    if (r && r.error) { toast.error(r.error); return }
    toast.success('介入申请已提交')
    setCreateIvOpen(false)
  }

  const openProcessIv = (iv) => {
    if (!canProcessIntervention(role)) { toast.error(getPermissionDeniedMessage('process_intervention')); return }
    setSelectedIvId(iv.id)
    setProcessIvOpen(true); setProcessIvResult(''); setProcessIvRemark(''); setProcessIvError('')
  }
  const confirmProcessIv = () => {
    if (!processIvResult) { setProcessIvError('请选择处理结果'); return }
    if (!processIvRemark.trim()) { setProcessIvError('处理意见不能为空'); return }
    const r = store.processIntervention(selectedIvId, processIvResult, processIvRemark.trim())
    if (r && r.error) { toast.error(r.error); return }
    toast.success(`已处理：${processIvResult}`)
    setProcessIvOpen(false)
  }

  const canCancel = [ORDER_STATUS.PENDING_CONFIRM, ORDER_STATUS.ACCEPTED, ORDER_STATUS.IN_SERVICE, ORDER_STATUS.EXCEPTION].includes(order.status)
  const canEscalate = order.status === ORDER_STATUS.IN_SERVICE && canEscalateException(role)
  const canResolve = order.status === ORDER_STATUS.EXCEPTION && canResolveException(role)
  const showAccept = order.status === ORDER_STATUS.PENDING_CONFIRM && canAcceptOrder(role)
  const showStart = order.status === ORDER_STATUS.ACCEPTED && canStartService(role)
  const showComplete = order.status === ORDER_STATUS.IN_SERVICE && canCompleteService(role)

  const contractSignable = contract && canSignContract(role) &&
    [CONTRACT_STATUS.PENDING_SIGN, CONTRACT_STATUS.USER_SIGNED, CONTRACT_STATUS.PROVIDER_SIGNED].includes(contract.status) &&
    ((role === ROLES.USER && !contract.user_signed) || (role === ROLES.PROVIDER && !contract.provider_signed))
  const contractRejectable = contract && canRejectContract(role) &&
    [CONTRACT_STATUS.PENDING_SIGN, CONTRACT_STATUS.USER_SIGNED, CONTRACT_STATUS.PROVIDER_SIGNED].includes(contract.status)
  const contractVoidable = contract && canVoidContract(role) && contract.status !== CONTRACT_STATUS.VOID
  const contractEditable = contract && canEditContract(role, contract)

  const canEscrowNow = payment && canEscrowPayment(role) && payment.status === PAYMENT_STATUS.PENDING_ESCROW
  const canConfirmNow = payment && canConfirmServiceComplete(role) && payment.status === PAYMENT_STATUS.IN_SERVICE_CONFIRMABLE
  const canApplyRefundNow = payment && canApplyRefund(role) && [PAYMENT_STATUS.ESCROWED, PAYMENT_STATUS.IN_SERVICE_CONFIRMABLE, PAYMENT_STATUS.PENDING_SETTLE].includes(payment.status)
  const canSettleNow = payment && canSettlePayment(role) && payment.status === PAYMENT_STATUS.PENDING_SETTLE
  const canProcessRefundNow = payment && canProcessRefund(role) && payment.status === PAYMENT_STATUS.REFUND_PROCESSING

  const canCreateIvNow = canCreateIntervention(role) && ![ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED].includes(order.status)

  return (
    <div>
      <div className="page-card" style={{ marginBottom: 16 }}>
        <div className="page-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>订单详情</span>
            <OrderStatusTag status={order.status} />
          </div>
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

        {contract && contract.status !== CONTRACT_STATUS.SIGNED && (
          <div className="permission-denied" style={{ background: '#fff7e6', borderColor: '#ffd591', color: '#d46b08' }}>
            ⚠️ 合同尚未签署完成（当前状态：{contract.status}），合同完全签署后才能开始服务
          </div>
        )}
        {payment && payment.status === PAYMENT_STATUS.PENDING_ESCROW && contract && contract.status === CONTRACT_STATUS.SIGNED && (
          <div className="permission-denied" style={{ background: '#e6f7ff', borderColor: '#91d5ff', color: '#1890ff' }}>
            💰 合同已签署，请先托管款项后再开始服务
          </div>
        )}

        <div className="detail-tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`detail-tab ${activeTab === t.key ? 'active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              <span style={{ marginRight: 4 }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {activeTab === 'basic' && (
          <div style={{ paddingTop: 20 }}>
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
            <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {contract && <Link to="#" onClick={e => { e.preventDefault(); setActiveTab('contract') }} className="tag">📝 合同状态：{contract.status}</Link>}
              {payment && <Link to="#" onClick={e => { e.preventDefault(); setActiveTab('payment') }} className="tag">💰 付款状态：{payment.status}</Link>}
              {interventions.length > 0 && <Link to="#" onClick={e => { e.preventDefault(); setActiveTab('intervention') }} className="tag" style={{ background: '#fff1f0', color: '#ff4d4f', borderColor: '#ffa39e' }}>⚖️ 介入申请：{interventions.length} 条</Link>}
            </div>
          </div>
        )}

        {activeTab === 'contract' && contract && (
          <div style={{ paddingTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="detail-section-title" style={{ marginBottom: 0 }}>服务合同</span>
                <ContractStatusTag status={contract.status} />
              </div>
              <div className="btn-group">
                {contractEditable && <button className="btn btn-default btn-sm" onClick={openEdit}>修改条款</button>}
                {contractRejectable && <button className="btn btn-danger btn-sm" onClick={openReject}>拒签</button>}
                {contractVoidable && <button className="btn btn-danger btn-sm" onClick={openVoid}>作废</button>}
                {contractSignable && <button className="btn btn-success btn-sm" onClick={doSignContract} disabled={signLoading === 'sign'}>{signLoading === 'sign' ? '...' : '签署合同'}</button>}
              </div>
            </div>
            <div className="detail-row"><span className="label">合同号</span><span className="value">{contract.id}</span></div>
            <div className="detail-row"><span className="label">需求方</span><span className="value">{contract.user_name}{contract.user_signed ? <span style={{ marginLeft: 8, color: '#52c41a' }}>（已签署 {contract.user_signed_at || ''}）</span> : <span style={{ marginLeft: 8, color: '#faad14' }}>（未签署）</span>}</span></div>
            <div className="detail-row"><span className="label">服务商</span><span className="value">{contract.provider_name}{contract.provider_signed ? <span style={{ marginLeft: 8, color: '#52c41a' }}>（已签署 {contract.provider_signed_at || ''}）</span> : <span style={{ marginLeft: 8, color: '#faad14' }}>（未签署）</span>}</span></div>
            <div className="detail-row"><span className="label">服务地点</span><span className="value">{contract.service_address}</span></div>
            <div className="detail-row"><span className="label">服务时间</span><span className="value">{contract.service_time}</span></div>
            <div className="detail-row"><span className="label">合同金额</span><span className="value" style={{ color: '#fa8c16', fontWeight: 600 }}>¥{contract.price}</span></div>
            <div className="detail-section" style={{ marginTop: 16 }}>
              <div className="detail-section-title">服务承诺</div>
              <div style={{ fontSize: 13, color: '#666', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{contract.service_commitment || '（暂无）'}</div>
            </div>
            <div className="detail-section">
              <div className="detail-section-title">违约说明</div>
              <div style={{ fontSize: 13, color: '#666', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{contract.breach_terms || '（暂无）'}</div>
            </div>
            {contract.reject_reason && (
              <div className="detail-section">
                <div className="detail-section-title" style={{ color: '#ff4d4f' }}>拒签信息</div>
                <div style={{ fontSize: 13, color: '#ff4d4f' }}>拒签方：{contract.reject_by}，原因：{contract.reject_reason}</div>
              </div>
            )}
            {contract.void_reason && (
              <div className="detail-section">
                <div className="detail-section-title" style={{ color: '#999' }}>作废说明</div>
                <div style={{ fontSize: 13, color: '#999' }}>{contract.void_reason}</div>
              </div>
            )}
            {!contractSignable && !contractEditable && contract.status === CONTRACT_STATUS.PENDING_SIGN && role === ROLES.ADMIN && (
              <div className="permission-denied" style={{ marginTop: 16 }}>💡 平台管理端可修改合同条款或作废合同，签署操作需切换到需求方或服务商端</div>
            )}
          </div>
        )}

        {activeTab === 'payment' && payment && (
          <div style={{ paddingTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="detail-section-title" style={{ marginBottom: 0 }}>担保付款节点</span>
                <PaymentStatusTag status={payment.status} />
              </div>
              <div className="btn-group">
                {canProcessRefundNow && <button className="btn btn-warning btn-sm" style={{ background: '#fa8c16', color: '#fff', border: 'none' }} onClick={openProcessRefund}>处理退款</button>}
                {canSettleNow && <button className="btn btn-success btn-sm" onClick={doSettle}>结算给服务商</button>}
                {canApplyRefundNow && <button className="btn btn-danger btn-sm" onClick={openRefund}>申请退款</button>}
                {canConfirmNow && <button className="btn btn-primary btn-sm" onClick={doConfirmComplete}>确认服务完成</button>}
                {canEscrowNow && <button className="btn btn-primary btn-sm" onClick={openEscrow}>托管付款</button>}
              </div>
            </div>

            <div className="payment-steps" style={{ marginBottom: 24 }}>
              {['待托管', '已托管', '服务中可确认', '待结算', '已结算'].map((step, idx) => {
                const stepIdx = ['待托管', '已托管', '服务中可确认', '待结算', '已结算'].indexOf(payment.status)
                const isDone = idx <= stepIdx && payment.status !== '退款处理中' && payment.status !== '已退款'
                const isRefund = (payment.status === '退款处理中' || payment.status === '已退款') && idx === stepIdx
                return (
                  <div key={step} className={`payment-step ${isDone ? 'done' : ''} ${isRefund ? 'exception' : ''}`}>
                    <div className="payment-step-dot" />
                    <div className="payment-step-label">{step}</div>
                  </div>
                )
              })}
            </div>

            {(payment.status === '退款处理中' || payment.status === '已退款') && (
              <div className="permission-denied" style={{ marginBottom: 16 }}>退款原因：{payment.refund_reason || '（无）'}</div>
            )}

            <div className="detail-row"><span className="label">付款单号</span><span className="value">{payment.id}</span></div>
            <div className="detail-row"><span className="label">订单金额</span><span className="value" style={{ fontWeight: 600 }}>¥{payment.amount.toLocaleString()}</span></div>
            <div className="detail-row"><span className="label">已托管</span><span className="value" style={{ color: '#1890ff' }}>¥{(payment.escrow_amount || 0).toLocaleString()}{payment.escrowed_at ? `（${payment.escrowed_at}）` : ''}</span></div>
            <div className="detail-row"><span className="label">已结算</span><span className="value" style={{ color: '#52c41a' }}>¥{(payment.settled_amount || 0).toLocaleString()}{payment.settled_at ? `（${payment.settled_at}）` : ''}</span></div>
            <div className="detail-row"><span className="label">已退款</span><span className="value" style={{ color: '#ff4d4f' }}>¥{(payment.refund_amount || 0).toLocaleString()}{payment.refund_at ? `（${payment.refund_at}）` : ''}</span></div>
            {canViewSettleInfo(role) && payment.status === PAYMENT_STATUS.PENDING_SETTLE && (
              <div className="detail-row"><span className="label">待结算给服务商</span><span className="value" style={{ color: '#722ed1', fontWeight: 600 }}>¥{(payment.escrow_amount - payment.refund_amount).toLocaleString()}</span></div>
            )}
          </div>
        )}

        {activeTab === 'intervention' && (
          <div style={{ paddingTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span className="detail-section-title" style={{ marginBottom: 0 }}>平台介入记录</span>
              {canCreateIvNow && <button className="btn btn-primary btn-sm" onClick={openCreateIv}>发起介入申请</button>}
            </div>
            {interventions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                <div style={{ fontSize: 36, marginBottom: 8, opacity: 0.5 }}>⚖️</div>
                <div style={{ fontSize: 14 }}>{canCreateIvNow ? '暂无介入申请，如有需要可点击右上角发起' : '暂无介入记录'}</div>
              </div>
            ) : (
              <div className="order-list">
                {interventions.map(iv => (
                  <div key={iv.id} className="order-card">
                    <div className="order-header">
                      <div>
                        <span className="order-id">介入单：{iv.id}</span>
                        <span style={{ marginLeft: 12 }}>发起人：{iv.initiator_name}（{iv.initiator_role === ROLES.USER ? '需求方' : '服务商'}）</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <InterventionStatusTag status={iv.status} />
                        {iv.status === INTERVENTION_STATUS.PENDING && canProcessIntervention(role) && (
                          <button className="btn btn-primary btn-sm" onClick={() => openProcessIv(iv)}>处理</button>
                        )}
                      </div>
                    </div>
                    <div className="order-body">
                      <div style={{ gridColumn: 'span 2' }}><span className="label">发起时间：</span>{iv.created_at}</div>
                      <div style={{ gridColumn: 'span 2' }}><span className="label">介入原因：</span>{iv.reason}</div>
                      <div style={{ gridColumn: 'span 2' }}><span className="label">诉求：</span>{iv.appeal}</div>
                      {iv.remark && <div style={{ gridColumn: 'span 2' }}><span className="label">补充说明：</span>{iv.remark}</div>}
                      {iv.result && (
                        <div style={{ gridColumn: 'span 2' }}>
                          <span className="label">处理结果：</span>
                          <span style={{ color: '#52c41a', fontWeight: 500 }}>{iv.result}</span>
                          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>处理意见：{iv.result_remark}</div>
                          <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>处理人：{iv.processed_by}，时间：{iv.processed_at}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div style={{ paddingTop: 20 }}>
            <OrderTimeline order={order} records={records} />
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

      {rejectOpen && (
        <div className="modal-overlay" onClick={() => setRejectOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">拒签合同</div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>拒签原因</label>
                <textarea className={`form-textarea ${rejectError ? 'error' : ''}`} rows={4} placeholder="请填写拒签原因" value={rejectReason} onChange={e => { setRejectReason(e.target.value); if (rejectError) setRejectError('') }} />
                {rejectError && <div className="form-error">{rejectError}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setRejectOpen(false)}>取消</button>
              <button className="btn btn-danger" onClick={confirmReject}>确认拒签</button>
            </div>
          </div>
        </div>
      )}

      {voidOpen && (
        <div className="modal-overlay" onClick={() => setVoidOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">作废合同</div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>作废原因</label>
                <textarea className={`form-textarea ${voidError ? 'error' : ''}`} rows={4} placeholder="请填写作废原因" value={voidReason} onChange={e => { setVoidReason(e.target.value); if (voidError) setVoidError('') }} />
                {voidError && <div className="form-error">{voidError}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setVoidOpen(false)}>取消</button>
              <button className="btn btn-danger" onClick={confirmVoid}>确认作废</button>
            </div>
          </div>
        </div>
      )}

      {editOpen && (
        <div className="modal-overlay" onClick={() => setEditOpen(false)}>
          <div className="modal" style={{ width: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">修改合同条款</div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">服务地点</label>
                  <input className="form-input" value={editForm.service_address} onChange={e => setEditForm({ ...editForm, service_address: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">服务时间</label>
                  <input className="form-input" value={editForm.service_time} onChange={e => setEditForm({ ...editForm, service_time: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">合同金额</label>
                <input type="number" className="form-input" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>服务承诺</label>
                <textarea className={`form-textarea ${editError.service_commitment ? 'error' : ''}`} rows={4} value={editForm.service_commitment} onChange={e => { setEditForm({ ...editForm, service_commitment: e.target.value }); if (editError.service_commitment) setEditError({ ...editError, service_commitment: '' }) }} />
                {editError.service_commitment && <div className="form-error">{editError.service_commitment}</div>}
              </div>
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>违约说明</label>
                <textarea className={`form-textarea ${editError.breach_terms ? 'error' : ''}`} rows={4} value={editForm.breach_terms} onChange={e => { setEditForm({ ...editForm, breach_terms: e.target.value }); if (editError.breach_terms) setEditError({ ...editError, breach_terms: '' }) }} />
                {editError.breach_terms && <div className="form-error">{editError.breach_terms}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setEditOpen(false)}>取消</button>
              <button className="btn btn-primary" onClick={confirmEdit}>保存修改</button>
            </div>
          </div>
        </div>
      )}

      {escrowOpen && (
        <div className="modal-overlay" onClick={() => setEscrowOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">托管付款</div>
            <div className="modal-body">
              <div style={{ marginBottom: 12, fontSize: 13, color: '#666' }}>订单金额：¥{payment?.amount.toLocaleString()}，请将对应款项托管至平台。</div>
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
                托管金额：¥{payment?.escrow_amount.toLocaleString()}，申请退款原因：{payment?.refund_reason}
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

      {createIvOpen && (
        <div className="modal-overlay" onClick={() => setCreateIvOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">发起平台介入</div>
            <div className="modal-body">
              <div style={{ marginBottom: 12, fontSize: 13, color: '#666' }}>订单：{order.id} - {order.profession_type}（{order.provider_name}）</div>
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>介入原因</label>
                <input className={`form-input ${createIvError.reason ? 'error' : ''}`} placeholder="例如：服务质量不达标、服务商未按时到达等" value={createIvForm.reason} onChange={e => { setCreateIvForm({ ...createIvForm, reason: e.target.value }); if (createIvError.reason) setCreateIvError({ ...createIvError, reason: '' }) }} />
                {createIvError.reason && <div className="form-error">{createIvError.reason}</div>}
              </div>
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>诉求内容</label>
                <textarea className={`form-textarea ${createIvError.appeal ? 'error' : ''}`} rows={3} placeholder="请描述您的具体诉求，例如：要求全额退款、要求部分退款、要求更换服务商等" value={createIvForm.appeal} onChange={e => { setCreateIvForm({ ...createIvForm, appeal: e.target.value }); if (createIvError.appeal) setCreateIvError({ ...createIvError, appeal: '' }) }} />
                {createIvError.appeal && <div className="form-error">{createIvError.appeal}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">补充说明</label>
                <textarea className="form-textarea" rows={2} placeholder="可选：其他需要说明的情况" value={createIvForm.remark} onChange={e => setCreateIvForm({ ...createIvForm, remark: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setCreateIvOpen(false)}>取消</button>
              <button className="btn btn-primary" onClick={confirmCreateIv}>提交申请</button>
            </div>
          </div>
        </div>
      )}

      {processIvOpen && (
        <div className="modal-overlay" onClick={() => setProcessIvOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">处理平台介入</div>
            <div className="modal-body">
              {(() => {
                const iv = interventions.find(i => i.id === selectedIvId)
                return iv ? (
                  <div style={{ marginBottom: 12, fontSize: 13, color: '#666' }}>
                    介入原因：{iv.reason}<br />诉求内容：{iv.appeal}
                  </div>
                ) : null
              })()}
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>处理结果</label>
                <select className={`form-select ${processIvError && !processIvResult ? 'error' : ''}`} value={processIvResult} onChange={e => { setProcessIvResult(e.target.value); if (processIvError) setProcessIvError('') }}>
                  <option value="">请选择</option>
                  {Object.values(INTERVENTION_RESULT).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>处理意见</label>
                <textarea className={`form-textarea ${processIvError ? 'error' : ''}`} rows={3} placeholder="请详细填写处理意见" value={processIvRemark} onChange={e => { setProcessIvRemark(e.target.value); if (processIvError) setProcessIvError('') }} />
                {processIvError && <div className="form-error">{processIvError}</div>}
              </div>
              <div style={{ fontSize: 12, color: '#999', padding: '8px 12px', background: '#fffbe6', borderRadius: 4 }}>
                💡 选择“全额退款”将自动取消订单并退还全部托管金额；<br />
                💡 选择“部分退款”将退还一半托管金额，另一半结算给服务商；<br />
                💡 选择“继续履约”若订单为异常状态将自动恢复为服务中。
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setProcessIvOpen(false)}>取消</button>
              <button className="btn btn-primary" onClick={confirmProcessIv}>确认处理</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

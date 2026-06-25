import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { store, ROLES, CONTRACT_STATUS } from '../store/localStore.js'
import { ContractStatusTag, OrderStatusTag } from '../components/StatusTags.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { canSignContract, canRejectContract, canVoidContract, canEditContract, getPermissionDeniedMessage } from '../services/permissions.js'
import EmptyState from '../components/EmptyState.jsx'

export default function ContractsPage() {
  const [, force] = React.useReducer((x) => x + 1, 0)
  React.useEffect(() => store.subscribe(() => force()), [])
  const toast = useToast()
  const state = store.getState()
  const role = state.currentRole

  const [statusFilter, setStatusFilter] = useState('')
  const [keyword, setKeyword] = useState('')

  const [detailId, setDetailId] = useState('')
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

  let filter = {}
  if (role === ROLES.USER) filter.user_id = state.currentUserId
  if (role === ROLES.PROVIDER) filter.provider_id = state.currentProviderId
  if (statusFilter) filter.status = statusFilter

  let list = store.listContracts(filter)
  if (keyword.trim()) {
    const kw = keyword.trim().toLowerCase()
    list = list.filter(c =>
      c.order_no.toLowerCase().includes(kw) ||
      c.user_name.toLowerCase().includes(kw) ||
      c.provider_name.toLowerCase().includes(kw) ||
      c.profession_type.toLowerCase().includes(kw)
    )
  }

  const detailContract = detailId ? store.getContract(detailId) : null

  const openDetail = (c) => {
    setDetailId(c.id)
    setEditForm({ service_commitment: c.service_commitment, breach_terms: c.breach_terms, service_address: c.service_address, service_time: c.service_time, price: c.price })
    setEditError({})
  }

  const doSign = (contractId) => {
    if (!canSignContract(role)) { toast.error(getPermissionDeniedMessage('sign_contract')); return }
    setSignLoading(contractId)
    const r = store.signContract(contractId)
    setSignLoading('')
    if (r.error) toast.error(r.error); else toast.success('签署成功')
  }

  const openReject = () => { setRejectOpen(true); setRejectReason(''); setRejectError('') }
  const confirmReject = () => {
    if (!canRejectContract(role)) { toast.error(getPermissionDeniedMessage('reject_contract')); return }
    if (!rejectReason.trim()) { setRejectError('拒签原因不能为空'); return }
    const r = store.rejectContract(detailId, rejectReason.trim())
    if (r.error) { toast.error(r.error); return }
    toast.success('已拒签')
    setRejectOpen(false)
  }

  const openVoid = () => { setVoidOpen(true); setVoidReason(''); setVoidError('') }
  const confirmVoid = () => {
    if (!canVoidContract(role)) { toast.error(getPermissionDeniedMessage('void_contract')); return }
    if (!voidReason.trim()) { setVoidError('作废原因不能为空'); return }
    const r = store.voidContract(detailId, voidReason.trim())
    if (r.error) { toast.error(r.error); return }
    toast.success('合同已作废')
    setVoidOpen(false)
  }

  const openEdit = () => {
    if (!canEditContract(role, detailContract)) { toast.error('当前状态或角色无法修改合同'); return }
    setEditOpen(true)
  }
  const confirmEdit = () => {
    const err = {}
    if (!editForm.service_commitment.trim()) err.service_commitment = '服务承诺不能为空'
    if (!editForm.breach_terms.trim()) err.breach_terms = '违约说明不能为空'
    setEditError(err)
    if (Object.keys(err).length) return
    const r = store.updateContract(detailId, editForm)
    if (r.error) { toast.error(r.error); return }
    toast.success('合同已更新')
    setEditOpen(false)
  }

  const signable = detailContract && canSignContract(role) &&
    [CONTRACT_STATUS.PENDING_SIGN, CONTRACT_STATUS.USER_SIGNED, CONTRACT_STATUS.PROVIDER_SIGNED].includes(detailContract.status) &&
    ((role === ROLES.USER && !detailContract.user_signed) || (role === ROLES.PROVIDER && !detailContract.provider_signed))

  const rejectable = detailContract && canRejectContract(role) &&
    [CONTRACT_STATUS.PENDING_SIGN, CONTRACT_STATUS.USER_SIGNED, CONTRACT_STATUS.PROVIDER_SIGNED].includes(detailContract.status)

  const voidable = detailContract && canVoidContract(role) &&
    detailContract.status !== CONTRACT_STATUS.VOID

  const editable = detailContract && canEditContract(role, detailContract)

  return (
    <div>
      <div className="page-card" style={{ marginBottom: 16 }}>
        <div className="page-title">
          <span>合同协议管理</span>
          <div style={{ fontSize: 13, color: '#999' }}>当前视角：{role === ROLES.USER ? '需求方' : role === ROLES.PROVIDER ? '服务商' : '平台管理端'}</div>
        </div>

        <div className="filter-bar">
          <div className="filter-item">
            <label>状态：</label>
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 160 }}>
              <option value="">全部</option>
              {Object.values(CONTRACT_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-item" style={{ flex: 1 }}>
            <label>搜索：</label>
            <input className="form-input" placeholder="输入订单号/需求方/服务商/职业类型" value={keyword} onChange={e => setKeyword(e.target.value)} style={{ maxWidth: 360 }} />
          </div>
        </div>

        {list.length === 0 ? (
          <EmptyState text={keyword || statusFilter ? '没有符合条件的合同' : '暂无合同数据'} />
        ) : (
          <div className="order-list">
            {list.map(c => (
              <div key={c.id} className="order-card" onClick={() => openDetail(c)} style={{ cursor: 'pointer' }}>
                <div className="order-header">
                  <div>
                    <span className="order-id">合同号：{c.id}</span>
                    <span style={{ marginLeft: 12 }}>订单号：<Link to={`/orders/${c.order_id}`} onClick={e => e.stopPropagation()} style={{ color: '#667eea' }}>{c.order_no}</Link></span>
                  </div>
                  <ContractStatusTag status={c.status} />
                </div>
                <div className="order-body">
                  <div><span className="label">职业类型：</span>{c.profession_type}</div>
                  <div><span className="label">合同金额：</span><span style={{ color: '#fa8c16', fontWeight: 600 }}>¥{c.price}</span></div>
                  <div><span className="label">需求方：</span>{c.user_name}</div>
                  <div><span className="label">服务商：</span>{c.provider_name}</div>
                  <div><span className="label">服务地点：</span>{c.service_address}</div>
                  <div><span className="label">服务时间：</span>{c.service_time}</div>
                </div>
                <div className="order-footer">
                  {c.user_signed && <span className="tag" style={{ background: '#f6ffed', color: '#52c41a', borderColor: '#b7eb8f' }}>需求方已签</span>}
                  {!c.user_signed && <span className="tag" style={{ background: '#fff7e6', color: '#faad14', borderColor: '#ffd591' }}>需求方待签</span>}
                  {c.provider_signed && <span className="tag" style={{ background: '#f6ffed', color: '#52c41a', borderColor: '#b7eb8f' }}>服务商已签</span>}
                  {!c.provider_signed && <span className="tag" style={{ background: '#fff7e6', color: '#faad14', borderColor: '#ffd591' }}>服务商待签</span>}
                  <span style={{ color: '#999', fontSize: 12, marginLeft: 'auto' }}>创建于 {c.created_at}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {detailContract && (
        <div className="modal-overlay" onClick={() => setDetailId('')}>
          <div className="modal" style={{ width: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>合同详情</span>
              <ContractStatusTag status={detailContract.status} />
            </div>
            <div className="modal-body">
              <div className="detail-row"><span className="label">合同号</span><span className="value">{detailContract.id}</span></div>
              <div className="detail-row"><span className="label">关联订单</span><span className="value"><Link to={`/orders/${detailContract.order_id}`} style={{ color: '#667eea' }}>{detailContract.order_no}</Link></span></div>
              <div className="detail-row"><span className="label">职业类型</span><span className="value">{detailContract.profession_type}</span></div>
              <div className="detail-row"><span className="label">需求方</span><span className="value">{detailContract.user_name}{detailContract.user_signed ? `（已签署 ${detailContract.user_signed_at || ''}）` : '（未签署）'}</span></div>
              <div className="detail-row"><span className="label">服务商</span><span className="value">{detailContract.provider_name}{detailContract.provider_signed ? `（已签署 ${detailContract.provider_signed_at || ''}）` : '（未签署）'}</span></div>
              <div className="detail-row"><span className="label">服务地点</span><span className="value">{detailContract.service_address}</span></div>
              <div className="detail-row"><span className="label">服务时间</span><span className="value">{detailContract.service_time}</span></div>
              <div className="detail-row"><span className="label">合同金额</span><span className="value" style={{ color: '#fa8c16', fontWeight: 600 }}>¥{detailContract.price}</span></div>
              <div className="detail-section" style={{ marginTop: 16 }}>
                <div className="detail-section-title">服务承诺</div>
                <div style={{ fontSize: 13, color: '#666', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{detailContract.service_commitment || '（暂无）'}</div>
              </div>
              <div className="detail-section">
                <div className="detail-section-title">违约说明</div>
                <div style={{ fontSize: 13, color: '#666', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{detailContract.breach_terms || '（暂无）'}</div>
              </div>
              {detailContract.reject_reason && (
                <div className="detail-section">
                  <div className="detail-section-title" style={{ color: '#ff4d4f' }}>拒签信息</div>
                  <div style={{ fontSize: 13, color: '#ff4d4f' }}>拒签方：{detailContract.reject_by}，原因：{detailContract.reject_reason}</div>
                </div>
              )}
              {detailContract.void_reason && (
                <div className="detail-section">
                  <div className="detail-section-title" style={{ color: '#999' }}>作废说明</div>
                  <div style={{ fontSize: 13, color: '#999' }}>{detailContract.void_reason}</div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setDetailId('')}>关闭</button>
              {editable && <button className="btn btn-default" onClick={openEdit}>修改条款</button>}
              {rejectable && <button className="btn btn-danger" onClick={openReject}>拒签</button>}
              {voidable && <button className="btn btn-danger" onClick={openVoid}>作废合同</button>}
              {signable && <button className="btn btn-success" onClick={() => doSign(detailContract.id)} disabled={signLoading === detailContract.id}>{signLoading === detailContract.id ? '...' : '签署合同'}</button>}
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

      {editOpen && detailContract && (
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
    </div>
  )
}

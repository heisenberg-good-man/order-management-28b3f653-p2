import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { store, ROLES, INTERVENTION_STATUS, INTERVENTION_RESULT, ORDER_STATUS } from '../store/localStore.js'
import { InterventionStatusTag, OrderStatusTag } from '../components/StatusTags.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { canCreateIntervention, canProcessIntervention, getPermissionDeniedMessage } from '../services/permissions.js'
import EmptyState from '../components/EmptyState.jsx'

export default function InterventionsPage() {
  const [, force] = React.useReducer((x) => x + 1, 0)
  React.useEffect(() => store.subscribe(() => force()), [])
  const toast = useToast()
  const state = store.getState()
  const role = state.currentRole
  const stats = store.stats()

  const [statusFilter, setStatusFilter] = useState('')
  const [keyword, setKeyword] = useState('')

  const [detailId, setDetailId] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ order_id: '', reason: '', appeal: '', remark: '' })
  const [createError, setCreateError] = useState({})
  const [processOpen, setProcessOpen] = useState(false)
  const [processResult, setProcessResult] = useState('')
  const [processRemark, setProcessRemark] = useState('')
  const [processError, setProcessError] = useState('')

  let filter = {}
  if (role === ROLES.USER) filter.user_id = state.currentUserId
  if (role === ROLES.PROVIDER) filter.provider_id = state.currentProviderId
  if (statusFilter) filter.status = statusFilter

  let list = store.listInterventions(filter)
  if (keyword.trim()) {
    const kw = keyword.trim().toLowerCase()
    list = list.filter(i =>
      i.order_no.toLowerCase().includes(kw) ||
      i.initiator_name.toLowerCase().includes(kw) ||
      i.reason.toLowerCase().includes(kw)
    )
  }

  let availableOrders = []
  if (role === ROLES.USER) {
    availableOrders = store.listOrders({ user_id: state.currentUserId })
  } else if (role === ROLES.PROVIDER) {
    availableOrders = store.listOrders({ provider_id: state.currentProviderId })
  } else {
    availableOrders = store.listOrders()
  }
  availableOrders = availableOrders.filter(o => ![ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED].includes(o.status))

  const detailIntervention = detailId ? store.getIntervention(detailId) : null
  const detailOrder = detailIntervention ? store.getOrder(detailIntervention.order_id) : null

  const openDetail = (iv) => setDetailId(iv.id)

  const openCreate = () => {
    if (!canCreateIntervention(role)) { toast.error(getPermissionDeniedMessage('create_intervention')); return }
    if (availableOrders.length === 0) { toast.error('无可发起介入的订单（订单需未完成/未取消）'); return }
    setCreateOpen(true)
    setCreateForm({ order_id: availableOrders[0]?.id || '', reason: '', appeal: '', remark: '' })
    setCreateError({})
  }
  const confirmCreate = () => {
    const err = {}
    if (!createForm.order_id) err.order_id = '请选择订单'
    if (!createForm.reason.trim()) err.reason = '介入原因不能为空'
    if (!createForm.appeal.trim()) err.appeal = '诉求内容不能为空'
    setCreateError(err)
    if (Object.keys(err).length) return
    const r = store.createIntervention(createForm)
    if (r.error) { toast.error(r.error); return }
    toast.success('介入申请已提交')
    setCreateOpen(false)
  }

  const openProcess = () => {
    if (!canProcessIntervention(role)) { toast.error(getPermissionDeniedMessage('process_intervention')); return }
    setProcessOpen(true); setProcessResult(''); setProcessRemark(''); setProcessError('')
  }
  const confirmProcess = () => {
    if (!processResult) { setProcessError('请选择处理结果'); return }
    if (!processRemark.trim()) { setProcessError('处理意见不能为空'); return }
    const r = store.processIntervention(detailId, processResult, processRemark.trim())
    if (r.error) { toast.error(r.error); return }
    toast.success(`已处理：${processResult}`)
    setProcessOpen(false)
  }

  const canCreate = canCreateIntervention(role)
  const canProcess = detailIntervention && canProcessIntervention(role) &&
    [INTERVENTION_STATUS.PENDING, INTERVENTION_STATUS.PROCESSING].includes(detailIntervention.status)

  return (
    <div>
      <div className="page-card" style={{ marginBottom: 16 }}>
        <div className="page-title">
          <span>平台介入管理</span>
          <div className="btn-group">
            {canCreate && <button className="btn btn-primary" onClick={openCreate}>发起介入申请</button>}
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card danger"><div className="stat-label">待处理</div><div className="stat-value">{stats.pending_interventions} 单</div></div>
          <div className="stat-card warning"><div className="stat-label">处理中</div><div className="stat-value">{stats.interventionStats['处理中'] || 0} 单</div></div>
          <div className="stat-card success"><div className="stat-label">已处理</div><div className="stat-value">{stats.interventionStats['已处理'] || 0} 单</div></div>
          <div className="stat-card"><div className="stat-label">已关闭</div><div className="stat-value">{stats.interventionStats['已关闭'] || 0} 单</div></div>
        </div>

        <div className="filter-bar">
          <div className="filter-item">
            <label>状态：</label>
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 160 }}>
              <option value="">全部</option>
              {Object.values(INTERVENTION_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-item" style={{ flex: 1 }}>
            <label>搜索：</label>
            <input className="form-input" placeholder="输入订单号/发起人/原因" value={keyword} onChange={e => setKeyword(e.target.value)} style={{ maxWidth: 360 }} />
          </div>
        </div>

        {list.length === 0 ? (
          <EmptyState text={keyword || statusFilter ? '没有符合条件的介入申请' : canCreate ? '暂无介入申请，可点击右上角发起' : '暂无介入申请数据'} />
        ) : (
          <div className="order-list">
            {list.map(iv => (
              <div key={iv.id} className="order-card" onClick={() => openDetail(iv)} style={{ cursor: 'pointer' }}>
                <div className="order-header">
                  <div>
                    <span className="order-id">介入单：{iv.id}</span>
                    <span style={{ marginLeft: 12 }}>订单：<Link to={`/orders/${iv.order_id}`} onClick={e => e.stopPropagation()} style={{ color: '#667eea' }}>{iv.order_no}</Link></span>
                  </div>
                  <InterventionStatusTag status={iv.status} />
                </div>
                <div className="order-body">
                  <div><span className="label">发起人：</span>{iv.initiator_name}（{iv.initiator_role === ROLES.USER ? '需求方' : '服务商'}）</div>
                  <div><span className="label">发起时间：</span>{iv.created_at}</div>
                  <div style={{ gridColumn: 'span 2' }}><span className="label">介入原因：</span>{iv.reason}</div>
                  <div style={{ gridColumn: 'span 2' }}><span className="label">诉求：</span>{iv.appeal}</div>
                  {iv.result && <div style={{ gridColumn: 'span 2' }}><span className="label">处理结果：</span><span style={{ color: '#52c41a', fontWeight: 500 }}>{iv.result}</span></div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {detailIntervention && (
        <div className="modal-overlay" onClick={() => setDetailId('')}>
          <div className="modal" style={{ width: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>介入申请详情</span>
              <InterventionStatusTag status={detailIntervention.status} />
            </div>
            <div className="modal-body">
              <div className="detail-row"><span className="label">介入单号</span><span className="value">{detailIntervention.id}</span></div>
              <div className="detail-row"><span className="label">关联订单</span><span className="value"><Link to={`/orders/${detailIntervention.order_id}`} style={{ color: '#667eea' }}>{detailIntervention.order_no}</Link></span></div>
              {detailOrder && <div className="detail-row"><span className="label">订单状态</span><span className="value"><OrderStatusTag status={detailOrder.status} /></span></div>}
              <div className="detail-row"><span className="label">发起人</span><span className="value">{detailIntervention.initiator_name}（{detailIntervention.initiator_role === ROLES.USER ? '需求方' : '服务商'}）</span></div>
              <div className="detail-row"><span className="label">发起时间</span><span className="value">{detailIntervention.created_at}</span></div>
              <div className="detail-section" style={{ marginTop: 16 }}>
                <div className="detail-section-title">介入原因</div>
                <div style={{ fontSize: 13, color: '#666' }}>{detailIntervention.reason}</div>
              </div>
              <div className="detail-section">
                <div className="detail-section-title">诉求内容</div>
                <div style={{ fontSize: 13, color: '#666' }}>{detailIntervention.appeal}</div>
              </div>
              {detailIntervention.remark && (
                <div className="detail-section">
                  <div className="detail-section-title">补充说明</div>
                  <div style={{ fontSize: 13, color: '#666' }}>{detailIntervention.remark}</div>
                </div>
              )}
              {detailIntervention.result && (
                <div className="detail-section">
                  <div className="detail-section-title" style={{ color: '#52c41a' }}>处理结果</div>
                  <div style={{ fontSize: 14, color: '#52c41a', fontWeight: 600, marginBottom: 8 }}>{detailIntervention.result}</div>
                  <div style={{ fontSize: 13, color: '#666' }}>处理意见：{detailIntervention.result_remark}</div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>处理人：{detailIntervention.processed_by}，时间：{detailIntervention.processed_at}</div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setDetailId('')}>关闭</button>
              {canProcess && <button className="btn btn-primary" onClick={openProcess}>处理介入</button>}
            </div>
          </div>
        </div>
      )}

      {createOpen && (
        <div className="modal-overlay" onClick={() => setCreateOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">发起平台介入</div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>选择订单</label>
                <select className={`form-select ${createError.order_id ? 'error' : ''}`} value={createForm.order_id} onChange={e => { setCreateForm({ ...createForm, order_id: e.target.value }); if (createError.order_id) setCreateError({ ...createError, order_id: '' }) }}>
                  <option value="">请选择要介入的订单</option>
                  {availableOrders.map(o => <option key={o.id} value={o.id}>{o.id} - {o.profession_type}（{o.provider_name}）- {o.status}</option>)}
                </select>
                {createError.order_id && <div className="form-error">{createError.order_id}</div>}
              </div>
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>介入原因</label>
                <input className={`form-input ${createError.reason ? 'error' : ''}`} placeholder="例如：服务质量不达标、服务商未按时到达等" value={createForm.reason} onChange={e => { setCreateForm({ ...createForm, reason: e.target.value }); if (createError.reason) setCreateError({ ...createError, reason: '' }) }} />
                {createError.reason && <div className="form-error">{createError.reason}</div>}
              </div>
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>诉求内容</label>
                <textarea className={`form-textarea ${createError.appeal ? 'error' : ''}`} rows={3} placeholder="请描述您的具体诉求，例如：要求全额退款、要求部分退款、要求更换服务商等" value={createForm.appeal} onChange={e => { setCreateForm({ ...createForm, appeal: e.target.value }); if (createError.appeal) setCreateError({ ...createError, appeal: '' }) }} />
                {createError.appeal && <div className="form-error">{createError.appeal}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">补充说明</label>
                <textarea className="form-textarea" rows={2} placeholder="可选：其他需要说明的情况" value={createForm.remark} onChange={e => setCreateForm({ ...createForm, remark: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setCreateOpen(false)}>取消</button>
              <button className="btn btn-primary" onClick={confirmCreate}>提交申请</button>
            </div>
          </div>
        </div>
      )}

      {processOpen && (
        <div className="modal-overlay" onClick={() => setProcessOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">处理平台介入</div>
            <div className="modal-body">
              <div style={{ marginBottom: 12, fontSize: 13, color: '#666' }}>
                介入原因：{detailIntervention?.reason}<br />
                诉求内容：{detailIntervention?.appeal}
              </div>
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>处理结果</label>
                <select className={`form-select ${processError && !processResult ? 'error' : ''}`} value={processResult} onChange={e => { setProcessResult(e.target.value); if (processError) setProcessError('') }}>
                  <option value="">请选择</option>
                  {Object.values(INTERVENTION_RESULT).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>处理意见</label>
                <textarea className={`form-textarea ${processError ? 'error' : ''}`} rows={3} placeholder="请详细填写处理意见" value={processRemark} onChange={e => { setProcessRemark(e.target.value); if (processError) setProcessError('') }} />
                {processError && <div className="form-error">{processError}</div>}
              </div>
              <div style={{ fontSize: 12, color: '#999', padding: '8px 12px', background: '#fffbe6', borderRadius: 4 }}>
                💡 选择“全额退款”将自动取消订单并退还全部托管金额；<br />
                💡 选择“部分退款”将退还一半托管金额，另一半结算给服务商；<br />
                💡 选择“继续履约”若订单为异常状态将自动恢复为服务中。
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setProcessOpen(false)}>取消</button>
              <button className="btn btn-primary" onClick={confirmProcess}>确认处理</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

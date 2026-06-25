import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { store, AUTH_STATUS, ROLES } from '../store/localStore.js'
import { validateAuth } from '../services/validator.js'
import { canReviewAuth, canSubmitAuth } from '../services/permissions.js'
import { AuthStatusTag } from '../components/StatusTags.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function AuthPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [, force] = React.useReducer((x) => x + 1, 0)
  React.useEffect(() => store.subscribe(() => force()), [])
  const state = store.getState()

  const [providerId, setProviderId] = useState(state.currentProviderId || '')
  const [form, setForm] = useState({ real_name: '', id_card_number: '', id_card_front: '', id_card_back: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState('')
  const [reviewProviderId, setReviewProviderId] = useState('')

  const provider = providerId ? store.getProvider(providerId) : null
  const auth = provider ? provider.auth : null
  const pendingList = store.listProviders({ auth_status: AUTH_STATUS.PENDING })

  const canSubmit = canSubmitAuth(state.currentRole) || state.currentRole === ROLES.ADMIN

  React.useEffect(() => {
    if (auth) {
      setForm({
        real_name: auth.real_name || '',
        id_card_number: auth.id_card_number || '',
        id_card_front: auth.id_card_front || '',
        id_card_back: auth.id_card_back || ''
      })
    }
  }, [provider?.id])

  const loadProvider = () => {
    if (!providerId.trim()) { toast.error('请输入服务商 ID'); return }
    const p = store.getProvider(providerId.trim())
    if (!p) { toast.error('未找到该服务商'); return }
    store.setCurrentProviderId(p.id)
    toast.success('已加载服务商资料')
  }

  const handleChange = (f, v) => {
    setForm(p => ({ ...p, [f]: v }))
    if (errors[f]) setErrors(p => { const n = { ...p }; delete n[f]; return n })
  }

  const canEdit = auth && auth.status !== AUTH_STATUS.APPROVED

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!provider) { toast.error('请先选择或输入服务商 ID'); return }
    const errs = validateAuth(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    store.submitAuth(provider.id, form)
    setLoading(false)
    toast.success('认证资料已提交，等待审核')
  }

  const handleApprove = (pid) => {
    store.approveAuth(pid)
    toast.success('已通过该服务商的实名认证')
  }

  const handleOpenReject = (pid) => {
    setReviewProviderId(pid)
    setRejectReason('')
    setRejectError('')
  }

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      setRejectError('拒绝原因不能为空')
      return
    }
    store.rejectAuth(reviewProviderId, rejectReason.trim())
    toast.success('已驳回实名认证')
    setReviewProviderId('')
    setRejectReason('')
    setRejectError('')
  }

  return (
    <div>
      <div className="page-card" style={{ marginBottom: 16 }}>
        <div className="page-title"><span>🆔 在线实名认证</span></div>
        <div className="filter-bar">
          <div className="filter-item">
            <label>服务商 ID：</label>
            <input className="form-input" style={{ width: 260 }} placeholder="输入服务商 ID 后点击加载" value={providerId} onChange={e => setProviderId(e.target.value)} />
            <button className="btn btn-primary btn-sm" onClick={loadProvider}>加载</button>
          </div>
          <div style={{ color: '#999', fontSize: 13 }}>
            提示：可先在 <a href="#/providers" onClick={e => { e.preventDefault(); navigate('/providers') }} style={{ color: '#667eea' }}>服务商列表</a> 复制 ID
          </div>
        </div>

        {!provider ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>👆</div>
            请先输入并加载服务商信息
          </div>
        ) : (
          <>
            <div style={{ background: '#f9f9f9', padding: 16, borderRadius: 6, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <span><strong>{provider.name}</strong>（{provider.profession_type}）</span>
                <AuthStatusTag status={auth.status} />
                {auth.submitted_at && <span style={{ color: '#999', fontSize: 12 }}>提交时间：{auth.submitted_at}</span>}
                {auth.reviewed_at && <span style={{ color: '#999', fontSize: 12 }}>审核时间：{auth.reviewed_at}</span>}
              </div>
              {auth.status === AUTH_STATUS.REJECTED && auth.reject_reason && (
                <div style={{ color: '#ff4d4f', fontSize: 13, marginTop: 8 }}>上次拒绝原因：{auth.reject_reason}，请修改后重新提交</div>
              )}
              {auth.status === AUTH_STATUS.APPROVED && (
                <div style={{ color: '#52c41a', fontSize: 13, marginTop: 8 }}>✅ 您的实名认证已通过</div>
              )}
              {auth.status === AUTH_STATUS.PENDING && (
                <div style={{ color: '#faad14', fontSize: 13, marginTop: 8 }}>⏳ 认证资料审核中，请耐心等待</div>
              )}
              {auth.status === AUTH_STATUS.NOT_SUBMITTED && (
                <div style={{ color: '#999', fontSize: 13, marginTop: 8 }}>📝 您还没有提交认证资料，请填写下方表单后提交</div>
              )}
            </div>

            <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label"><span className="required">*</span>真实姓名</label>
                  <input className={`form-input ${errors.real_name ? 'error' : ''}`} value={form.real_name} onChange={e => handleChange('real_name', e.target.value)} placeholder="请输入身份证上的姓名" disabled={!canEdit} />
                  {errors.real_name && <div className="form-error">{errors.real_name}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label"><span className="required">*</span>身份证号</label>
                  <input className={`form-input ${errors.id_card_number ? 'error' : ''}`} value={form.id_card_number} onChange={e => handleChange('id_card_number', e.target.value)} placeholder="18 位身份证号，末位可为 X" disabled={!canEdit} />
                  {errors.id_card_number && <div className="form-error">{errors.id_card_number}</div>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label"><span className="required">*</span>身份证正面 URL</label>
                  <input className={`form-input ${errors.id_card_front ? 'error' : ''}`} value={form.id_card_front} onChange={e => handleChange('id_card_front', e.target.value)} placeholder="mock：可填入任意字符串代表上传成功" disabled={!canEdit} />
                  {errors.id_card_front && <div className="form-error">{errors.id_card_front}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label"><span className="required">*</span>身份证反面 URL</label>
                  <input className={`form-input ${errors.id_card_back ? 'error' : ''}`} value={form.id_card_back} onChange={e => handleChange('id_card_back', e.target.value)} placeholder="mock：可填入任意字符串代表上传成功" disabled={!canEdit} />
                  {errors.id_card_back && <div className="form-error">{errors.id_card_back}</div>}
                </div>
              </div>
              {canEdit && canSubmit && (
                <div className="btn-group">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? '提交中...' : auth.status === AUTH_STATUS.REJECTED ? '重新提交认证' : '提交认证'}
                  </button>
                </div>
              )}
              {canEdit && !canSubmit && (
                <div className="permission-denied">💡 当前角色无法提交认证，请切换到服务商端</div>
              )}
              {!canEdit && (
                <div style={{ color: '#999', fontSize: 13 }}>已通过认证的资料不可修改，如需变更请联系平台。</div>
              )}
            </form>
          </>
        )}
      </div>

      {canReviewAuth(state.currentRole) ? (
        <div className="page-card">
          <div className="page-title"><span>🛠️ 管理员审核区（待审核 {pendingList.length} 人）</span></div>
          {pendingList.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#999' }}>暂无待审核的认证申请</div>
          ) : (
            <div className="order-list">
              {pendingList.map(p => (
                <div key={p.id} className="order-card">
                  <div className="order-header">
                    <div><strong>{p.name}</strong> · {p.profession_type} <span style={{ color: '#999', fontSize: 13, marginLeft: 12 }}>ID: {p.id}</span></div>
                    <AuthStatusTag status={p.auth.status} />
                  </div>
                  <div className="order-body">
                    <div><span className="label">真实姓名：</span>{p.auth.real_name}</div>
                    <div><span className="label">身份证号：</span>{p.auth.id_card_number}</div>
                    <div><span className="label">提交时间：</span>{p.auth.submitted_at}</div>
                  </div>
                  <div className="order-footer">
                    <button className="btn btn-success btn-sm" onClick={() => handleApprove(p.id)}>通过认证</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleOpenReject(p.id)}>拒绝认证</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="page-card">
          <div style={{ padding: 32, textAlign: 'center', color: '#999' }}>审核功能仅限平台管理端，请切换角色后操作</div>
        </div>
      )}

      {reviewProviderId && (
        <div className="modal-overlay" onClick={() => setReviewProviderId('')}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">拒绝实名认证</div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>拒绝原因</label>
                <textarea className={`form-textarea ${rejectError ? 'error' : ''}`} rows={4} placeholder="请填写具体的拒绝原因，方便服务商修改后重新提交" value={rejectReason} onChange={e => { setRejectReason(e.target.value); if (rejectError) setRejectError('') }} />
                {rejectError && <div className="form-error">{rejectError}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setReviewProviderId('')}>取消</button>
              <button className="btn btn-danger" onClick={handleConfirmReject}>确认拒绝</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

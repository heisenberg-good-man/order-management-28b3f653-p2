import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { store, PROFESSION_TYPES, AUTH_STATUS } from '../store/localStore.js'
import { validateProvider } from '../services/validator.js'
import { canEditProvider } from '../services/permissions.js'
import { AuthStatusTag, OrderStatusTag } from '../components/StatusTags.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function ProviderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [, force] = React.useReducer((x) => x + 1, 0)
  React.useEffect(() => store.subscribe(() => force()), [])
  const state = store.getState()

  const provider = store.getProvider(id)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const canEdit = canEditProvider(state.currentRole)

  React.useEffect(() => {
    if (provider) {
      setForm({
        name: provider.name,
        profession_type: provider.profession_type,
        service_area: provider.service_area,
        service_tags: (provider.service_tags || []).join(','),
        pricing_mode: provider.pricing_mode,
        price_range: provider.price_range,
        intro: provider.intro,
        phone: provider.phone
      })
    }
  }, [provider?.id])

  if (!provider) {
    return (
      <div className="page-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
        <h3 style={{ marginBottom: 8 }}>未找到该服务商</h3>
        <p style={{ color: '#999', marginBottom: 20 }}>服务商 ID 可能有误，或已被删除。</p>
        <div className="btn-group" style={{ justifyContent: 'center' }}>
          <Link to="/providers" className="btn btn-primary">返回服务商列表</Link>
        </div>
      </div>
    )
  }

  const handleChange = (f, v) => {
    setForm(p => ({ ...p, [f]: v }))
    if (errors[f]) setErrors(p => { const n = { ...p }; delete n[f]; return n })
  }

  const handleSave = (e) => {
    e.preventDefault()
    const data = {
      ...form,
      service_tags: form.service_tags ? String(form.service_tags).split(/[,，\s]+/).filter(Boolean) : []
    }
    const errs = validateProvider(data)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    store.updateProvider(provider.id, data)
    setLoading(false)
    toast.success('资料已更新')
    setEditing(false)
  }

  const providerOrders = store.listOrders({ provider_id: provider.id })

  return (
    <div>
      <div className="page-card" style={{ marginBottom: 16 }}>
        <div className="page-title">
          <span>服务商详情：{provider.name}</span>
          <div className="btn-group">
            <Link to="/providers" className="btn btn-default">返回列表</Link>
            <button className="btn btn-default" onClick={() => { store.setCurrentProviderId(provider.id); navigate('/auth') }}>
              查看实名认证
            </button>
            {canEdit && (
              <button className="btn btn-primary" onClick={() => setEditing(v => !v)} disabled={loading}>
                {editing ? '取消编辑' : '编辑资料'}
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, padding: 12, background: '#f9f9f9', borderRadius: 6 }}>
          <span>认证状态：</span><AuthStatusTag status={provider.auth.status} />
          {provider.auth.status === AUTH_STATUS.REJECTED && (
            <span style={{ color: '#ff4d4f', fontSize: 13 }}>上次拒绝原因：{provider.auth.reject_reason}</span>
          )}
          {provider.auth.status === AUTH_STATUS.PENDING && (
            <span style={{ color: '#faad14', fontSize: 13 }}>已提交，等待管理员审核</span>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} style={{ maxWidth: 700 }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>姓名</label>
                <input className={`form-input ${errors.name ? 'error' : ''}`} value={form.name || ''} onChange={e => handleChange('name', e.target.value)} />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>职业类型</label>
                <select className={`form-select ${errors.profession_type ? 'error' : ''}`} value={form.profession_type || ''} onChange={e => handleChange('profession_type', e.target.value)}>
                  <option value="">请选择</option>
                  {PROFESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.profession_type && <div className="form-error">{errors.profession_type}</div>}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label"><span className="required">*</span>服务区域</label>
              <input className={`form-input ${errors.service_area ? 'error' : ''}`} value={form.service_area || ''} onChange={e => handleChange('service_area', e.target.value)} />
              {errors.service_area && <div className="form-error">{errors.service_area}</div>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">服务标签（逗号分隔）</label>
                <input className="form-input" value={form.service_tags || ''} onChange={e => handleChange('service_tags', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">报价范围</label>
                <input className={`form-input ${errors.price_range ? 'error' : ''}`} value={form.price_range || ''} onChange={e => handleChange('price_range', e.target.value)} placeholder="例：100-500" />
                {errors.price_range && <div className="form-error">{errors.price_range}</div>}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">联系电话</label>
              <input className="form-input" value={form.phone || ''} onChange={e => handleChange('phone', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">个人简介</label>
              <textarea className="form-textarea" value={form.intro || ''} onChange={e => handleChange('intro', e.target.value)} />
            </div>
            <div className="btn-group">
              <button type="button" className="btn btn-default" onClick={() => setEditing(false)}>取消</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '保存中...' : '保存修改'}</button>
            </div>
          </form>
        ) : (
          <>
            <div className="detail-row"><span className="label">服务商 ID</span><span className="value">{provider.id}</span></div>
            <div className="detail-row"><span className="label">姓名</span><span className="value">{provider.name}</span></div>
            <div className="detail-row"><span className="label">职业类型</span><span className="value">{provider.profession_type}</span></div>
            <div className="detail-row"><span className="label">服务区域</span><span className="value">{provider.service_area}</span></div>
            <div className="detail-row"><span className="label">服务标签</span><span className="value">
              {provider.service_tags?.length ? provider.service_tags.map((t, i) => <span key={i} className="tag" style={{ marginRight: 6 }}>{t}</span>) : '无'}
            </span></div>
            <div className="detail-row"><span className="label">报价方式</span><span className="value">{provider.pricing_mode || '未设置'}</span></div>
            <div className="detail-row"><span className="label">报价范围</span><span className="value">{provider.price_range || '未设置'}</span></div>
            <div className="detail-row"><span className="label">联系电话</span><span className="value">{provider.phone || '未填写'}</span></div>
            <div className="detail-row"><span className="label">入驻时间</span><span className="value">{provider.created_at}</span></div>
            <div className="detail-row"><span className="label">个人简介</span><span className="value">{provider.intro || '暂无'}</span></div>
          </>
        )}
      </div>

      <div className="page-card">
        <div className="page-title"><span>关联订单（{providerOrders.length}）</span></div>
        {providerOrders.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#999' }}>暂无订单记录</div>
        ) : (
          <div className="order-list">
            {providerOrders.map(o => (
              <div key={o.id} className="order-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/orders/${o.id}`)}>
                <div className="order-header">
                  <div><strong>{o.profession_type}</strong> <span style={{ color: '#999', fontSize: 13, marginLeft: 12 }}>客户：{o.user_name}</span></div>
                  <OrderStatusTag status={o.status} />
                </div>
                <div className="order-body">
                  <div><span className="label">地点：</span>{o.location}</div>
                  <div><span className="label">预算：</span>¥{o.budget}</div>
                  <div><span className="label">期望时间：</span>{o.expected_time}</div>
                  <div><span className="label">创建：</span>{o.created_at}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

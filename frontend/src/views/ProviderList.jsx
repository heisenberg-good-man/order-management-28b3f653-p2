import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { store, PROFESSION_TYPES, AUTH_STATUS } from '../store/localStore.js'
import { validateProvider } from '../services/validator.js'
import { canRegisterProvider, getPermissionDeniedMessage } from '../services/permissions.js'
import { AuthStatusTag } from '../components/StatusTags.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function ProviderList() {
  const navigate = useNavigate()
  const toast = useToast()
  const [, force] = React.useReducer((x) => x + 1, 0)
  React.useEffect(() => store.subscribe(() => force()), [])
  const state = store.getState()

  const [fProf, setFProf] = useState('')
  const [fAuth, setFAuth] = useState('')
  const [keyword, setKeyword] = useState('')
  const [showReg, setShowReg] = useState(false)

  const [regForm, setRegForm] = useState({
    name: '', profession_type: '', service_area: '', service_tags: '',
    pricing_mode: '', price_range: '', intro: '', phone: ''
  })
  const [regErrors, setRegErrors] = useState({})
  const [regLoading, setRegLoading] = useState(false)

  const canRegister = canRegisterProvider(state.currentRole)

  let list = store.listProviders({ profession_type: fProf || undefined, auth_status: fAuth || undefined })
  if (keyword.trim()) {
    const k = keyword.trim().toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(k) || p.service_area.toLowerCase().includes(k) || (p.service_tags || []).join(',').toLowerCase().includes(k))
  }

  const handleRegChange = (f, v) => {
    setRegForm(p => ({ ...p, [f]: v }))
    if (regErrors[f]) setRegErrors(p => { const n = { ...p }; delete n[f]; return n })
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    const data = {
      ...regForm,
      service_tags: regForm.service_tags ? regForm.service_tags.split(/[,，\s]+/).filter(Boolean) : []
    }
    const errors = validateProvider(data)
    if (Object.keys(errors).length) { setRegErrors(errors); return }
    setRegLoading(true)
    const p = store.createProvider(data)
    setRegLoading(false)
    toast.success(`入驻成功！服务商ID：${p.id}，请前往实名认证页提交资料`)
    setShowReg(false)
    setRegForm({ name: '', profession_type: '', service_area: '', service_tags: '', pricing_mode: '', price_range: '', intro: '', phone: '' })
    navigate(`/providers/${p.id}`)
  }

  return (
    <div>
      <div className="page-card" style={{ marginBottom: 16 }}>
        <div className="page-title">
          <span>👷 服务商列表（共 {list.length} 人）</span>
          {canRegister ? (
            <button className="btn btn-primary" onClick={() => setShowReg(v => !v)}>
              {showReg ? '收起表单' : '+ 申请入驻'}
            </button>
          ) : (
            <div className="permission-denied">💡 {getPermissionDeniedMessage('register_provider')}</div>
          )}
        </div>

        {canRegister && showReg && (
          <div style={{ background: '#f9f9f9', padding: 16, borderRadius: 6, marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>服务商入驻表单</div>
            <form onSubmit={handleRegister} style={{ maxWidth: 700 }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label"><span className="required">*</span>姓名</label>
                  <input className={`form-input ${regErrors.name ? 'error' : ''}`} value={regForm.name} onChange={e => handleRegChange('name', e.target.value)} placeholder="请输入真实姓名" />
                  {regErrors.name && <div className="form-error">{regErrors.name}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label"><span className="required">*</span>职业类型</label>
                  <select className={`form-select ${regErrors.profession_type ? 'error' : ''}`} value={regForm.profession_type} onChange={e => handleRegChange('profession_type', e.target.value)}>
                    <option value="">请选择职业类型</option>
                    {PROFESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {regErrors.profession_type && <div className="form-error">{regErrors.profession_type}</div>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>服务区域</label>
                <input className={`form-input ${regErrors.service_area ? 'error' : ''}`} value={regForm.service_area} onChange={e => handleRegChange('service_area', e.target.value)} placeholder="多个区域用逗号分隔，如：朝阳区,海淀区" />
                {regErrors.service_area && <div className="form-error">{regErrors.service_area}</div>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">服务标签</label>
                  <input className="form-input" value={regForm.service_tags} onChange={e => handleRegChange('service_tags', e.target.value)} placeholder="多个标签用逗号/空格分隔，如：金牌月嫂,5年经验" />
                </div>
                <div className="form-group">
                  <label className="form-label">报价范围</label>
                  <input className={`form-input ${regErrors.price_range ? 'error' : ''}`} value={regForm.price_range} onChange={e => handleRegChange('price_range', e.target.value)} placeholder="格式：最低-最高，例如 100-500" />
                  {regErrors.price_range && <div className="form-error">{regErrors.price_range}</div>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">联系电话</label>
                <input className="form-input" value={regForm.phone} onChange={e => handleRegChange('phone', e.target.value)} placeholder="请输入联系电话" />
              </div>
              <div className="form-group">
                <label className="form-label">个人简介</label>
                <textarea className="form-textarea" value={regForm.intro} onChange={e => handleRegChange('intro', e.target.value)} placeholder="请简要介绍您的工作经历和专业技能" />
              </div>
              <div className="btn-group">
                <button type="button" className="btn btn-default" onClick={() => setShowReg(false)}>取消</button>
                <button type="submit" className="btn btn-primary" disabled={regLoading}>{regLoading ? '提交中...' : '提交入驻'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="filter-bar">
          <div className="filter-item"><label>搜索：</label>
            <input className="form-input" style={{ width: 200 }} placeholder="按姓名/区域/标签搜索" value={keyword} onChange={e => setKeyword(e.target.value)} />
          </div>
          <div className="filter-item"><label>职业：</label>
            <select className="form-select" style={{ width: 140 }} value={fProf} onChange={e => setFProf(e.target.value)}>
              <option value="">全部</option>
              {PROFESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="filter-item"><label>认证：</label>
            <select className="form-select" style={{ width: 140 }} value={fAuth} onChange={e => setFAuth(e.target.value)}>
              <option value="">全部</option>
              {Object.values(AUTH_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {list.length === 0 ? (
          <EmptyState text={keyword ? `没有找到与"${keyword}"匹配的服务商` : '暂无服务商，点击右上角「申请入驻」添加'} />
        ) : (
          <div className="provider-list">
            {list.map(p => (
              <div key={p.id} className="provider-card">
                <div className="provider-header">
                  <div>
                    <Link to={`/providers/${p.id}`} style={{ textDecoration: 'none' }}>
                      <div className="provider-name" style={{ color: '#667eea' }}>{p.name} →</div>
                    </Link>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{p.profession_type} · ID: {p.id.slice(0, 18)}...</div>
                  </div>
                  <AuthStatusTag status={p.auth.status} />
                </div>
                <div className="provider-meta">
                  <div><span className="label">服务区域：</span>{p.service_area}</div>
                  <div><span className="label">报价：</span>{p.pricing_mode || '未设置'} {p.price_range || ''}</div>
                  {p.phone && <div><span className="label">电话：</span>{p.phone}</div>}
                </div>
                {p.service_tags?.length > 0 && (
                  <div className="tag-list" style={{ marginTop: 8 }}>
                    {p.service_tags.map((t, i) => <span key={i} className="tag">{t}</span>)}
                  </div>
                )}
                {p.intro && <div className="provider-intro">{p.intro}</div>}
                <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <Link to={`/providers/${p.id}`} className="btn btn-default btn-sm">查看详情</Link>
                  <button className="btn btn-primary btn-sm" onClick={() => { store.setCurrentProviderId(p.id); navigate('/auth') }}>去认证</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

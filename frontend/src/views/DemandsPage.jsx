import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { store, PROFESSION_TYPES } from '../store/localStore.js'
import { canPublishDemand, getPermissionDeniedMessage } from '../services/permissions.js'
import { validateDemand } from '../services/validator.js'
import EmptyState from '../components/EmptyState.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function DemandsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [, force] = React.useReducer((x) => x + 1, 0)
  React.useEffect(() => store.subscribe(() => force()), [])
  const state = store.getState()

  const canPublish = canPublishDemand(state.currentRole)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ profession_type: '', location: '', budget: '', expected_time: '', remark: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [fProf, setFProf] = useState('')

  let demands = store.listDemands()
  if (fProf) demands = demands.filter(d => d.profession_type === fProf)

  const handleChange = (f, v) => {
    setForm(p => ({ ...p, [f]: v }))
    if (errors[f]) setErrors(p => { const n = { ...p }; delete n[f]; return n })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canPublishDemand(state.currentRole)) {
      toast.error(getPermissionDeniedMessage('publish_demand'))
      return
    }
    const errs = validateDemand(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    const d = store.createDemand(form)
    setSubmitting(false)
    toast.success('需求发布成功，正在跳转撮合推荐页...')
    setShowForm(false)
    setForm({ profession_type: '', location: '', budget: '', expected_time: '', remark: '' })
    setTimeout(() => navigate(`/matches/${d.id}`), 600)
  }

  return (
    <div>
      <div className="page-card" style={{ marginBottom: 16 }}>
        <div className="page-title">
          <span>📋 用工需求</span>
          {canPublish ? (
            <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
              {showForm ? '收起发布表单' : '+ 发布新需求'}
            </button>
          ) : (
            <div className="permission-denied" style={{ color: '#e74c3c', fontSize: 13, background: '#fef0f0', padding: '6px 14px', borderRadius: 6 }}>
              💡 {getPermissionDeniedMessage('publish_demand')}，请切换到用户端
            </div>
          )}
        </div>

        {canPublish && showForm && (
          <div style={{ background: '#f9f9f9', padding: 16, borderRadius: 6, marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>发布新需求</div>
            <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label"><span className="required">*</span>职业类型</label>
                  <select className={`form-select ${errors.profession_type ? 'error' : ''}`} value={form.profession_type} onChange={e => handleChange('profession_type', e.target.value)}>
                    <option value="">请选择职业类型</option>
                    {PROFESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.profession_type && <div className="form-error">{errors.profession_type}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label"><span className="required">*</span>预算（元）</label>
                  <input type="number" className={`form-input ${errors.budget ? 'error' : ''}`} value={form.budget} onChange={e => handleChange('budget', e.target.value)} placeholder="例如：5000" />
                  {errors.budget && <div className="form-error">{errors.budget}</div>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>服务地点</label>
                <input className={`form-input ${errors.location ? 'error' : ''}`} value={form.location} onChange={e => handleChange('location', e.target.value)} placeholder="请输入详细地址，如：朝阳区建国路88号" />
                {errors.location && <div className="form-error">{errors.location}</div>}
              </div>
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>期望服务时间</label>
                <input type="date" className={`form-input ${errors.expected_time ? 'error' : ''}`} value={form.expected_time} onChange={e => handleChange('expected_time', e.target.value)} />
                {errors.expected_time && <div className="form-error">{errors.expected_time}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">备注说明</label>
                <textarea className="form-textarea" value={form.remark} onChange={e => handleChange('remark', e.target.value)} placeholder="具体需求描述、技能要求等" />
              </div>
              <div className="btn-group">
                <button type="button" className="btn btn-default" onClick={() => setShowForm(false)}>取消</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? '发布中...' : '发布并匹配服务商'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="filter-bar">
          <div className="filter-item"><label>按职业筛选：</label>
            <select className="form-select" style={{ width: 140 }} value={fProf} onChange={e => setFProf(e.target.value)}>
              <option value="">全部</option>
              {PROFESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ color: '#999', fontSize: 13 }}>共 {demands.length} 条需求</div>
        </div>

        {demands.length === 0 ? (
          <EmptyState text={fProf ? '该职业下暂无需求' : '暂无需求，点击右上角「发布新需求」开始'} />
        ) : (
          <div className="order-list">
            {demands.map(d => (
              <div key={d.id} className="order-card">
                <div className="order-header">
                  <div>
                    <strong style={{ fontSize: 15 }}>{d.profession_type}</strong>
                    <span style={{ color: '#999', fontSize: 13, marginLeft: 12 }}>编号：{d.id}</span>
                    <span style={{ color: '#999', fontSize: 13, marginLeft: 12 }}>发布人：{d.user_name}</span>
                  </div>
                  <span className="tag">预算：¥{d.budget}</span>
                </div>
                <div className="order-body">
                  <div><span className="label">服务地点：</span>{d.location}</div>
                  <div><span className="label">期望时间：</span>{d.expected_time}</div>
                  <div style={{ gridColumn: '1 / -1' }}><span className="label">备注：</span>{d.remark || '无'}</div>
                  <div style={{ gridColumn: '1 / -1', color: '#999', fontSize: 12 }}>发布时间：{d.created_at}</div>
                </div>
                <div className="order-footer">
                  <button className="btn btn-primary btn-sm" onClick={() => navigate(`/matches/${d.id}`)}>查看匹配服务商</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

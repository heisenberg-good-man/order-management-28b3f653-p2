import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { providerApi } from '../../api/index.js'
import { useToast } from '../../context/ToastContext.jsx'
import { AuthStatusTag } from '../../components/StatusTags.jsx'

export default function ProviderProfile() {
  const navigate = useNavigate()
  const toast = useToast()
  const [providerId, setProviderId] = useState('')
  const [provider, setProvider] = useState(null)
  const [form, setForm] = useState({
    name: '',
    profession_type: '',
    service_area: '',
    service_tags: '',
    pricing_mode: '',
    price_range: '',
    intro: '',
    phone: '',
  })
  const [errors, setErrors] = useState({})
  const [options, setOptions] = useState({ profession_types: [], pricing_modes: [] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    providerApi.options().then((r) => r.code === 0 && setOptions(r.data))
    const id = sessionStorage.getItem('currentProviderId')
    if (id) {
      setProviderId(id)
      loadProvider(id)
    } else {
      setLoading(false)
    }
  }, [])

  const loadProvider = async (id) => {
    setLoading(true)
    const res = await providerApi.get(id)
    setLoading(false)
    if (res.code === 0) {
      setProvider(res.data)
      setForm({
        name: res.data.name,
        profession_type: res.data.profession_type,
        service_area: res.data.service_area,
        service_tags: res.data.service_tags?.join(',') || '',
        pricing_mode: res.data.pricing_mode,
        price_range: res.data.price_range,
        intro: res.data.intro,
        phone: res.data.phone,
      })
    } else {
      toast.error(res.message || '加载失败')
    }
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const n = { ...prev }
        delete n[field]
        return n
      })
    }
  }

  const handleLoadProfile = () => {
    if (!providerId.trim()) {
      toast.error('请输入服务商ID')
      return
    }
    loadProvider(providerId.trim())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!provider) {
      toast.error('请先加载服务商资料')
      return
    }
    const data = {
      ...form,
      service_tags: form.service_tags
        ? form.service_tags.split(/[,，\s]+/).filter(Boolean)
        : [],
    }
    setSaving(true)
    const res = await providerApi.update(provider.id, data)
    setSaving(false)
    if (res.code === 0) {
      toast.success('资料更新成功')
      setProvider(res.data)
    } else {
      if (res.errors) setErrors(res.errors)
      toast.error(res.message || '更新失败')
    }
  }

  if (loading) return <div className="page-card">加载中...</div>

  return (
    <div className="page-card">
      <div className="page-title">资料编辑</div>
      {!provider ? (
        <div style={{ maxWidth: 400 }}>
          <div className="form-group">
            <label className="form-label">服务商ID</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                className="form-input"
                placeholder="请输入服务商ID"
                value={providerId}
                onChange={(e) => setProviderId(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleLoadProfile}>
                加载资料
              </button>
            </div>
            <div className="form-tip">
              提示：先通过"服务商入驻"创建账号后，在此处输入ID加载资料进行编辑
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ background: '#f9f9f9', padding: 12, borderRadius: 4, marginBottom: 20 }}>
            <span style={{ marginRight: 12 }}>当前服务商：<strong>{provider.name}</strong></span>
            <span style={{ marginRight: 12 }}>ID：{provider.id}</span>
            <AuthStatusTag status={provider.auth_status} />
          </div>
          <form onSubmit={handleSubmit} style={{ maxWidth: 700 }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <span className="required">*</span>姓名
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">
                  <span className="required">*</span>职业类型
                </label>
                <select
                  className={`form-select ${errors.profession_type ? 'error' : ''}`}
                  value={form.profession_type}
                  onChange={(e) => handleChange('profession_type', e.target.value)}
                >
                  <option value="">请选择职业类型</option>
                  {options.profession_types.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.profession_type && <div className="form-error">{errors.profession_type}</div>}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">
                <span className="required">*</span>服务区域
              </label>
              <input
                type="text"
                className={`form-input ${errors.service_area ? 'error' : ''}`}
                value={form.service_area}
                onChange={(e) => handleChange('service_area', e.target.value)}
              />
              {errors.service_area && <div className="form-error">{errors.service_area}</div>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">报价方式</label>
                <select
                  className={`form-select ${errors.pricing_mode ? 'error' : ''}`}
                  value={form.pricing_mode}
                  onChange={(e) => handleChange('pricing_mode', e.target.value)}
                >
                  <option value="">请选择报价方式</option>
                  {options.pricing_modes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {errors.pricing_mode && <div className="form-error">{errors.pricing_mode}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">报价范围</label>
                <input
                  type="text"
                  className={`form-input ${errors.price_range ? 'error' : ''}`}
                  placeholder="格式：最低-最高"
                  value={form.price_range}
                  onChange={(e) => handleChange('price_range', e.target.value)}
                />
                {errors.price_range && <div className="form-error">{errors.price_range}</div>}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">服务标签</label>
              <input
                type="text"
                className="form-input"
                placeholder="多个标签用逗号分隔"
                value={form.service_tags}
                onChange={(e) => handleChange('service_tags', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">联系电话</label>
              <input
                type="text"
                className="form-input"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">个人简介</label>
              <textarea
                className="form-textarea"
                value={form.intro}
                onChange={(e) => handleChange('intro', e.target.value)}
              />
            </div>
            <div className="btn-group" style={{ marginTop: 24 }}>
              <button
                type="button"
                className="btn btn-default"
                onClick={() => navigate('/provider/auth')}
              >
                去实名认证
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? '保存中...' : '保存修改'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}

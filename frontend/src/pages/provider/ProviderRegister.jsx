import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { providerApi } from '../../api'
import { useToast } from '../../context/ToastContext'

export default function ProviderRegister() {
  const navigate = useNavigate()
  const toast = useToast()
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
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    providerApi.options().then((res) => {
      if (res.code === 0) setOptions(res.data)
    })
  }, [])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = {
      ...form,
      service_tags: form.service_tags
        ? form.service_tags.split(/[,，\s]+/).filter(Boolean)
        : [],
    }
    setSubmitting(true)
    const res = await providerApi.create(data)
    setSubmitting(false)
    if (res.code === 0) {
      toast.success('入驻成功，请尽快完成实名认证')
      sessionStorage.setItem('currentProviderId', res.data.id)
      navigate('/provider/auth')
    } else {
      if (res.errors) setErrors(res.errors)
      toast.error(res.message || '提交失败')
    }
  }

  return (
    <div className="page-card">
      <div className="page-title">服务商入驻</div>
      <form onSubmit={handleSubmit} style={{ maxWidth: 700 }}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span>姓名
            </label>
            <input
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="请输入真实姓名"
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
            placeholder="多个区域用逗号分隔，例如：朝阳区,海淀区"
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
              placeholder="格式：最低-最高，例如 100-500"
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
            placeholder="多个标签用逗号或空格分隔，例如：金牌月嫂,5年经验"
            value={form.service_tags}
            onChange={(e) => handleChange('service_tags', e.target.value)}
          />
          <div className="form-tip">多个标签用逗号或空格分隔</div>
        </div>
        <div className="form-group">
          <label className="form-label">联系电话</label>
          <input
            type="text"
            className="form-input"
            placeholder="请输入联系电话"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">个人简介</label>
          <textarea
            className="form-textarea"
            placeholder="请简要介绍您的工作经历和专业技能"
            value={form.intro}
            onChange={(e) => handleChange('intro', e.target.value)}
          />
        </div>
        <div className="btn-group" style={{ marginTop: 24 }}>
          <button type="button" className="btn btn-default" onClick={() => navigate(-1)}>
            取消
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? '提交中...' : '提交入驻'}
          </button>
        </div>
      </form>
    </div>
  )
}

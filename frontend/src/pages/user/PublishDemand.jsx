import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { demandApi, providerApi } from '../../api'
import { useToast } from '../../context/ToastContext'

export default function UserPublishDemand() {
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({
    profession_type: '',
    location: '',
    budget: '',
    expected_time: '',
    remark: '',
  })
  const [errors, setErrors] = useState({})
  const [options, setOptions] = useState({ profession_types: [] })
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
    setSubmitting(true)
    const res = await demandApi.create(form)
    setSubmitting(false)
    if (res.code === 0) {
      toast.success('需求发布成功')
      navigate(`/user/demands/${res.data.id}/match`)
    } else {
      if (res.errors) {
        setErrors(res.errors)
      }
      toast.error(res.message || '发布失败')
    }
  }

  return (
    <div className="page-card">
      <div className="page-title">发布用工需求</div>
      <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
        <div className="form-row">
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
          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span>预算（元）
            </label>
            <input
              type="number"
              className={`form-input ${errors.budget ? 'error' : ''}`}
              placeholder="例如：5000"
              value={form.budget}
              onChange={(e) => handleChange('budget', e.target.value)}
            />
            {errors.budget && <div className="form-error">{errors.budget}</div>}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">
            <span className="required">*</span>服务地点
          </label>
          <input
            type="text"
            className={`form-input ${errors.location ? 'error' : ''}`}
            placeholder="请输入详细地址，例如：朝阳区建国路88号"
            value={form.location}
            onChange={(e) => handleChange('location', e.target.value)}
          />
          {errors.location && <div className="form-error">{errors.location}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">
            <span className="required">*</span>期望服务时间
          </label>
          <input
            type="date"
            className={`form-input ${errors.expected_time ? 'error' : ''}`}
            value={form.expected_time}
            onChange={(e) => handleChange('expected_time', e.target.value)}
          />
          {errors.expected_time && <div className="form-error">{errors.expected_time}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">备注说明</label>
          <textarea
            className="form-textarea"
            placeholder="请输入具体需求描述，如技能要求、工作内容等"
            value={form.remark}
            onChange={(e) => handleChange('remark', e.target.value)}
          />
        </div>
        <div className="btn-group" style={{ marginTop: 24 }}>
          <button type="button" className="btn btn-default" onClick={() => navigate(-1)}>
            取消
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? '提交中...' : '发布需求并匹配'}
          </button>
        </div>
      </form>
    </div>
  )
}

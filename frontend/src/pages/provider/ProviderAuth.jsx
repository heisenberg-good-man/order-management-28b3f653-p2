import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi, providerApi } from '../../api/index.js'
import { AuthStatusTag } from '../../components/StatusTags.jsx'
import { AUTH_STATUS } from '../../utils/constants.js'
import { useToast } from '../../context/ToastContext.jsx'

export default function ProviderAuth() {
  const navigate = useNavigate()
  const toast = useToast()
  const [providerId, setProviderId] = useState('')
  const [authInfo, setAuthInfo] = useState(null)
  const [form, setForm] = useState({
    real_name: '',
    id_card_number: '',
    id_card_front: '',
    id_card_back: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const id = sessionStorage.getItem('currentProviderId')
    if (id) {
      setProviderId(id)
      loadAuth(id)
    } else {
      setLoading(false)
    }
  }, [])

  const loadAuth = async (id) => {
    setLoading(true)
    const res = await authApi.get(id)
    setLoading(false)
    if (res.code === 0) {
      setAuthInfo(res.data)
      setForm({
        real_name: res.data.real_name || '',
        id_card_number: res.data.id_card_number || '',
        id_card_front: res.data.id_card_front || '',
        id_card_back: res.data.id_card_back || '',
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

  const handleLoad = () => {
    if (!providerId.trim()) {
      toast.error('请输入服务商ID')
      return
    }
    sessionStorage.setItem('currentProviderId', providerId.trim())
    loadAuth(providerId.trim())
  }

  const canEdit = !authInfo || authInfo.status !== AUTH_STATUS.APPROVED

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!providerId.trim()) {
      toast.error('请先加载服务商')
      return
    }
    setSubmitting(true)
    const res = await authApi.submit(providerId.trim(), form)
    setSubmitting(false)
    if (res.code === 0) {
      toast.success('认证资料已提交，等待审核')
      setAuthInfo(res.data)
    } else {
      if (res.errors) setErrors(res.errors)
      toast.error(res.message || '提交失败')
    }
  }

  if (loading) return <div className="page-card">加载中...</div>

  return (
    <div className="page-card">
      <div className="page-title">在线实名认证</div>
      {!authInfo ? (
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
              <button className="btn btn-primary" onClick={handleLoad}>
                加载认证信息
              </button>
            </div>
            <div className="form-tip">提示：先通过"服务商入驻"创建账号后再进行实名认证</div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ background: '#f9f9f9', padding: 16, borderRadius: 4, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span>当前认证状态：</span>
              <AuthStatusTag status={authInfo.status} />
            </div>
            {authInfo.status === AUTH_STATUS.REJECTED && authInfo.reject_reason && (
              <div style={{ color: '#ff4d4f', fontSize: 13 }}>
                拒绝原因：{authInfo.reject_reason}，请修改后重新提交
              </div>
            )}
            {authInfo.status === AUTH_STATUS.PENDING && (
              <div style={{ color: '#faad14', fontSize: 13 }}>
                您的认证资料已提交，正在审核中，请耐心等待
              </div>
            )}
            {authInfo.status === AUTH_STATUS.APPROVED && (
              <div style={{ color: '#52c41a', fontSize: 13 }}>
                恭喜您，实名认证已通过
              </div>
            )}
            {authInfo.submitted_at && (
              <div style={{ color: '#999', fontSize: 12, marginTop: 6 }}>
                提交时间：{authInfo.submitted_at}
                {authInfo.reviewed_at && ` | 审核时间：${authInfo.reviewed_at}`}
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <span className="required">*</span>真实姓名
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.real_name ? 'error' : ''}`}
                  placeholder="请输入身份证上的真实姓名"
                  value={form.real_name}
                  onChange={(e) => handleChange('real_name', e.target.value)}
                  disabled={!canEdit}
                />
                {errors.real_name && <div className="form-error">{errors.real_name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">
                  <span className="required">*</span>身份证号
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.id_card_number ? 'error' : ''}`}
                  placeholder="请输入18位身份证号"
                  value={form.id_card_number}
                  onChange={(e) => handleChange('id_card_number', e.target.value)}
                  disabled={!canEdit}
                />
                {errors.id_card_number && <div className="form-error">{errors.id_card_number}</div>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <span className="required">*</span>身份证正面照
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.id_card_front ? 'error' : ''}`}
                  placeholder="请输入图片URL（mock）"
                  value={form.id_card_front}
                  onChange={(e) => handleChange('id_card_front', e.target.value)}
                  disabled={!canEdit}
                />
                {errors.id_card_front && <div className="form-error">{errors.id_card_front}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">
                  <span className="required">*</span>身份证反面照
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.id_card_back ? 'error' : ''}`}
                  placeholder="请输入图片URL（mock）"
                  value={form.id_card_back}
                  onChange={(e) => handleChange('id_card_back', e.target.value)}
                  disabled={!canEdit}
                />
                {errors.id_card_back && <div className="form-error">{errors.id_card_back}</div>}
              </div>
            </div>
            {canEdit && (
              <div className="btn-group" style={{ marginTop: 24 }}>
                <button type="button" className="btn btn-default" onClick={() => navigate(-1)}>
                  返回
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? '提交中...' : authInfo?.status === AUTH_STATUS.REJECTED ? '重新提交' : '提交认证'}
                </button>
              </div>
            )}
          </form>
        </>
      )}
    </div>
  )
}

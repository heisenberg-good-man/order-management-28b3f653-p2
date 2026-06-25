import React, { useState, useEffect } from 'react'
import { adminApi, authApi } from '../../api'
import EmptyState from '../../components/EmptyState'
import { AuthStatusTag } from '../../components/StatusTags'
import { AUTH_STATUS } from '../../utils/constants'
import { useToast } from '../../context/ToastContext'

export default function AdminProviderList() {
  const toast = useToast()
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterAuth, setFilterAuth] = useState('')
  const [rejectModal, setRejectModal] = useState({ visible: false, providerId: '' })
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState('')
  const [actionLoading, setActionLoading] = useState('')

  useEffect(() => {
    loadData()
  }, [filterAuth])

  const loadData = async () => {
    setLoading(true)
    const params = {}
    if (filterAuth) params.auth_status = filterAuth
    const res = await adminApi.providers(params)
    setLoading(false)
    if (res.code === 0) {
      setProviders(res.data)
    } else {
      toast.error(res.message || '加载失败')
    }
  }

  const handleApprove = async (providerId) => {
    setActionLoading(providerId + '-approve')
    const res = await authApi.approve(providerId)
    setActionLoading('')
    if (res.code === 0) {
      toast.success('认证已通过')
      loadData()
    } else {
      toast.error(res.message || '操作失败')
    }
  }

  const openRejectModal = (providerId) => {
    setRejectModal({ visible: true, providerId })
    setRejectReason('')
    setRejectError('')
  }

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      setRejectError('请填写拒绝原因')
      return
    }
    setActionLoading(rejectModal.providerId + '-reject')
    const res = await authApi.reject(rejectModal.providerId, rejectReason.trim())
    setActionLoading('')
    if (res.code === 0) {
      toast.success('认证已拒绝')
      setRejectModal({ visible: false, providerId: '' })
      loadData()
    } else {
      toast.error(res.message || '操作失败')
    }
  }

  return (
    <div className="page-card">
      <div className="page-title">
        <span>服务商管理</span>
      </div>
      <div className="filter-bar">
        <div className="filter-item">
          <label>认证状态：</label>
          <select
            className="form-select"
            style={{ width: 140 }}
            value={filterAuth}
            onChange={(e) => setFilterAuth(e.target.value)}
          >
            <option value="">全部</option>
            {Object.values(AUTH_STATUS).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      {loading ? (
        <div>加载中...</div>
      ) : providers.length === 0 ? (
        <EmptyState text="暂无服务商" />
      ) : (
        <div className="order-list">
          {providers.map((p) => (
            <div key={p.id} className="order-card">
              <div className="order-header">
                <div>
                  <strong style={{ fontSize: 15 }}>{p.name}</strong>
                  <span style={{ marginLeft: 12, color: '#999', fontSize: 13 }}>
                    {p.profession_type}
                  </span>
                  <span style={{ marginLeft: 12, color: '#999', fontSize: 13 }}>
                    ID：{p.id}
                  </span>
                </div>
                <AuthStatusTag status={p.auth_status} />
              </div>
              <div className="order-body">
                <div>
                  <span className="label">服务区域：</span>
                  {p.service_area}
                </div>
                <div>
                  <span className="label">报价：</span>
                  {p.pricing_mode} {p.price_range}
                </div>
                <div>
                  <span className="label">联系电话：</span>
                  {p.phone || '未填写'}
                </div>
                <div>
                  <span className="label">入驻时间：</span>
                  {p.created_at}
                </div>
                {p.auth && p.auth.status !== AUTH_STATUS.NOT_SUBMITTED && (
                  <>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span className="label">真实姓名：</span>
                      {p.auth.real_name || '-'}
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span className="label">身份证号：</span>
                      {p.auth.id_card_number || '-'}
                    </div>
                    {p.auth.reject_reason && (
                      <div style={{ gridColumn: '1 / -1', color: '#ff4d4f' }}>
                        <span className="label" style={{ color: '#ff4d4f' }}>上次拒绝原因：</span>
                        {p.auth.reject_reason}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="order-footer">
                {p.auth_status === AUTH_STATUS.PENDING && (
                  <>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleApprove(p.id)}
                      disabled={actionLoading === p.id + '-approve'}
                    >
                      {actionLoading === p.id + '-approve' ? '处理中...' : '通过认证'}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => openRejectModal(p.id)}
                      disabled={actionLoading === p.id + '-reject'}
                    >
                      {actionLoading === p.id + '-reject' ? '处理中...' : '拒绝认证'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {rejectModal.visible && (
        <div className="modal-overlay" onClick={() => setRejectModal({ visible: false, providerId: '' })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">拒绝实名认证</div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  <span className="required">*</span>拒绝原因
                </label>
                <textarea
                  className={`form-textarea ${rejectError ? 'error' : ''}`}
                  placeholder="请输入拒绝原因..."
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value)
                    if (rejectError) setRejectError('')
                  }}
                  rows={4}
                />
                {rejectError && <div className="form-error">{rejectError}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-default"
                onClick={() => setRejectModal({ visible: false, providerId: '' })}
              >
                取消
              </button>
              <button className="btn btn-danger" onClick={confirmReject}>
                确认拒绝
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { providerApi } from '../../api'
import EmptyState from '../../components/EmptyState'
import { AuthStatusTag } from '../../components/StatusTags'
import { AUTH_STATUS } from '../../utils/constants'
import { useToast } from '../../context/ToastContext'

export default function ProviderList() {
  const navigate = useNavigate()
  const toast = useToast()
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterProfession, setFilterProfession] = useState('')
  const [filterAuth, setFilterAuth] = useState('')
  const [options, setOptions] = useState({ profession_types: [] })

  useEffect(() => {
    providerApi.options().then((r) => r.code === 0 && setOptions(r.data))
  }, [])

  useEffect(() => {
    loadData()
  }, [filterProfession, filterAuth])

  const loadData = async () => {
    setLoading(true)
    const params = {}
    if (filterProfession) params.profession_type = filterProfession
    if (filterAuth) params.auth_status = filterAuth
    const res = await providerApi.list(params)
    setLoading(false)
    if (res.code === 0) {
      setProviders(res.data)
    } else {
      toast.error(res.message || '加载失败')
    }
  }

  return (
    <div className="page-card">
      <div className="page-title">
        <span>服务商列表</span>
        <button className="btn btn-primary" onClick={() => navigate('/provider/register')}>
          + 申请入驻
        </button>
      </div>
      <div className="filter-bar">
        <div className="filter-item">
          <label>职业：</label>
          <select
            className="form-select"
            style={{ width: 140 }}
            value={filterProfession}
            onChange={(e) => setFilterProfession(e.target.value)}
          >
            <option value="">全部</option>
            {options.profession_types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-item">
          <label>认证：</label>
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
        <div className="provider-list">
          {providers.map((p) => (
            <div key={p.id} className="provider-card">
              <div className="provider-header">
                <div>
                  <div className="provider-name">{p.name}</div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                    {p.profession_type}
                  </div>
                </div>
                <AuthStatusTag status={p.auth_status} />
              </div>
              <div className="provider-meta">
                <div>
                  <span className="label">服务区域：</span>
                  {p.service_area}
                </div>
                <div>
                  <span className="label">报价方式：</span>
                  {p.pricing_mode || '未设置'}
                </div>
                <div>
                  <span className="label">报价范围：</span>
                  {p.price_range || '未设置'}
                </div>
                {p.phone && (
                  <div>
                    <span className="label">联系电话：</span>
                    {p.phone}
                  </div>
                )}
              </div>
              {p.service_tags?.length > 0 && (
                <div className="tag-list" style={{ marginTop: 8 }}>
                  {p.service_tags.map((tag, idx) => (
                    <span key={idx} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {p.intro && <div className="provider-intro">{p.intro}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

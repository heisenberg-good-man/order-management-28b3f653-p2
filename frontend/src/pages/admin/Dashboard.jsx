import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../../api/index.js'
import { useToast } from '../../context/ToastContext.jsx'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const toast = useToast()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const res = await adminApi.stats()
    setLoading(false)
    if (res.code === 0) {
      setStats(res.data)
    } else {
      toast.error(res.message || '加载失败')
    }
  }

  if (loading) return <div className="page-card">加载中...</div>
  if (!stats) return <div className="page-card">加载失败</div>

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-label">服务商总数</div>
          <div className="stat-value">{stats.total_providers}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">订单总数</div>
          <div className="stat-value">{stats.total_orders}</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">待审核认证</div>
          <div className="stat-value">{stats.auth_stats['待审核'] || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">已通过认证</div>
          <div className="stat-value" style={{ color: '#52c41a' }}>
            {stats.auth_stats['已通过'] || 0}
          </div>
        </div>
      </div>
      <div className="page-card" style={{ marginBottom: 16 }}>
        <div className="page-title">
          <span>实名认证统计</span>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin/providers')}>
            查看服务商列表
          </button>
        </div>
        <div className="stats-grid" style={{ marginBottom: 0 }}>
          {Object.entries(stats.auth_stats).map(([k, v]) => (
            <div key={k} className="stat-card">
              <div className="stat-label">{k}</div>
              <div className="stat-value">{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="page-card">
        <div className="page-title">
          <span>订单状态统计</span>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin/orders')}>
            查看订单列表
          </button>
        </div>
        <div className="stats-grid" style={{ marginBottom: 0 }}>
          {Object.entries(stats.order_stats).map(([k, v]) => (
            <div key={k} className="stat-card">
              <div className="stat-label">{k}</div>
              <div className="stat-value">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

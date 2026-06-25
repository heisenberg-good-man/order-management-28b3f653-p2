import React from 'react'
import { Link } from 'react-router-dom'
import { store, ROLE_LABELS } from '../store/localStore.js'
import { AuthStatusTag, OrderStatusTag } from '../components/StatusTags.jsx'

export default function Home() {
  const [, force] = React.useReducer((x) => x + 1, 0)
  React.useEffect(() => store.subscribe(() => force()), [])
  const stats = store.stats()
  const state = store.getState()

  const cards = [
    { title: '服务商管理', desc: '查看服务商列表、入驻编辑资料', to: '/providers', icon: '👷', color: '#667eea' },
    { title: '实名认证', desc: '提交认证资料、查看审核状态', to: '/auth', icon: '🆔', color: '#52c41a' },
    { title: '发布用工需求', desc: '填写职业类型、地点、预算等', to: '/demands', icon: '📋', color: '#faad14' },
    { title: '撮合推荐', desc: '基于需求智能匹配合适的服务商', to: '/matches', icon: '🤝', color: '#13c2c2' },
    { title: '订单管理', desc: '查看订单、跟踪进度、状态流转', to: '/orders', icon: '📦', color: '#eb2f96' },
    { title: '角色切换', desc: '在用户/服务商/管理员视角间切换', to: '/roles', icon: '🎭', color: '#722ed1' },
  ]

  return (
    <div>
      <div className="page-card" style={{ marginBottom: 16 }}>
        <div className="page-title">
          <span>平台概览（当前视角：{ROLE_LABELS[state.currentRole]}）</span>
          <div className="btn-group">
            <button className="btn btn-default btn-sm" onClick={() => { if (confirm('确认重置所有数据到初始状态？')) { store.reset(); location.reload() } }}>
              重置演示数据
            </button>
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat-card primary"><div className="stat-label">服务商总数</div><div className="stat-value">{stats.total_providers}</div></div>
          <div className="stat-card success"><div className="stat-label">订单总数</div><div className="stat-value">{stats.total_orders}</div></div>
          <div className="stat-card warning"><div className="stat-label">待审核认证</div><div className="stat-value" style={{ color: '#faad14' }}>{stats.authStats['待审核'] || 0}</div></div>
          <div className="stat-card"><div className="stat-label">已通过认证</div><div className="stat-value" style={{ color: '#52c41a' }}>{stats.authStats['已通过'] || 0}</div></div>
        </div>
        <div className="detail-section" style={{ marginTop: 16 }}>
          <div className="detail-section-title">认证状态分布</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {Object.entries(stats.authStats).map(([k, v]) => (
              <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <AuthStatusTag status={k} /> <span style={{ fontSize: 13, color: '#666' }}>{v} 人</span>
              </span>
            ))}
          </div>
        </div>
        <div className="detail-section">
          <div className="detail-section-title">订单状态分布</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {Object.entries(stats.orderStats).map(([k, v]) => (
              <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <OrderStatusTag status={k} /> <span style={{ fontSize: 13, color: '#666' }}>{v} 单</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="page-card">
        <div className="page-title">快速入口</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 16 }}>
          {cards.map(c => (
            <Link key={c.to} to={c.to} style={{ textDecoration: 'none' }}>
              <div className="provider-card" style={{ borderTop: `3px solid ${c.color}` }}>
                <div style={{ fontSize: 28 }}>{c.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#333', marginTop: 8 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>{c.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

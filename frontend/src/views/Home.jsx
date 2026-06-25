import React from 'react'
import { Link } from 'react-router-dom'
import { store, ROLE_LABELS, ROLES } from '../store/localStore.js'
import {
  AuthStatusTag,
  OrderStatusTag,
  ContractStatusTag,
  PaymentStatusTag,
  InterventionStatusTag,
} from '../components/StatusTags.jsx'

export default function Home() {
  const [, force] = React.useReducer((x) => x + 1, 0)
  React.useEffect(() => store.subscribe(() => force()), [])
  const stats = store.stats()
  const state = store.getState()

  const roleCards = {
    [ROLES.USER]: [
      { title: '发布用工需求', desc: '填写职业类型、地点、预算等', to: '/demands', icon: '📋', color: '#faad14' },
      { title: '撮合推荐', desc: '基于需求智能匹配合适的服务商', to: '/matches', icon: '🤝', color: '#13c2c2' },
      { title: '我的订单', desc: '查看订单、跟踪进度、取消订单', to: '/orders', icon: '📦', color: '#eb2f96' },
      { title: '合同协议', desc: '查看待签合同、签署/拒签合同', to: '/contracts', icon: '📝', color: '#722ed1' },
      { title: '担保付款', desc: '托管付款、确认服务、申请退款', to: '/payments', icon: '💰', color: '#fa8c16' },
      { title: '平台介入', desc: '发起介入申请、查看处理进度', to: '/interventions', icon: '⚖️', color: '#eb2f96' },
    ],
    [ROLES.PROVIDER]: [
      { title: '服务商管理', desc: '入驻、编辑资料、维护信息', to: '/providers', icon: '👷', color: '#667eea' },
      { title: '实名认证', desc: '提交认证资料、查看审核状态', to: '/auth', icon: '🆔', color: '#52c41a' },
      { title: '我的订单', desc: '接单、更新服务进度、完成服务', to: '/orders', icon: '📦', color: '#eb2f96' },
      { title: '合同协议', desc: '查看合同、签署/拒签合同', to: '/contracts', icon: '📝', color: '#722ed1' },
      { title: '担保收款', desc: '查看待结算金额、结算状态', to: '/payments', icon: '💰', color: '#fa8c16' },
      { title: '平台介入', desc: '发起介入申请、查看处理进度', to: '/interventions', icon: '⚖️', color: '#eb2f96' },
    ],
    [ROLES.ADMIN]: [
      { title: '服务商管理', desc: '查看所有服务商信息', to: '/providers', icon: '👷', color: '#667eea' },
      { title: '实名认证审核', desc: '审核认证申请、通过/驳回', to: '/auth', icon: '🆔', color: '#52c41a' },
      { title: '订单管理', desc: '监控全部订单、处理异常', to: '/orders', icon: '📦', color: '#eb2f96' },
      { title: '合同管理', desc: '查看全部合同、作废合同', to: '/contracts', icon: '📝', color: '#722ed1' },
      { title: '付款结算', desc: '处理退款、结算托管资金', to: '/payments', icon: '💰', color: '#fa8c16' },
      { title: '介入处理', desc: '处理平台介入申请、出具结果', to: '/interventions', icon: '⚖️', color: '#eb2f96' },
    ],
  }

  const formatMoney = (n) => `¥${Number(n || 0).toFixed(2)}`

  return (
    <div>
      <div className="page-card" style={{ marginBottom: 16 }}>
        <div className="page-title">
          <span>平台概览（当前视角：{ROLE_LABELS[state.currentRole]}）</span>
          <div className="btn-group">
            <button
              className="btn btn-default btn-sm"
              onClick={() => {
                if (confirm('确认重置所有数据到初始状态？')) {
                  store.reset()
                  location.reload()
                }
              }}
            >
              重置演示数据
            </button>
          </div>
        </div>
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
            <div className="stat-value" style={{ color: '#faad14' }}>
              {stats.authStats['待审核'] || 0}
            </div>
          </div>
          <div className="stat-card danger">
            <div className="stat-label">异常订单</div>
            <div className="stat-value" style={{ color: '#ff4d4f' }}>
              {stats.orderStats['异常待处理'] || 0}
            </div>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #722ed1' }}>
            <div className="stat-label">📝 待签合同</div>
            <div className="stat-value" style={{ color: '#722ed1' }}>
              {stats.pending_sign_contracts || 0}
            </div>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #fa8c16' }}>
            <div className="stat-label">💰 待托管付款</div>
            <div className="stat-value" style={{ color: '#fa8c16' }}>
              {stats.pending_escrow_payments || 0}
            </div>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #eb2f96' }}>
            <div className="stat-label">⚖️ 待处理介入</div>
            <div className="stat-value" style={{ color: '#eb2f96' }}>
              {stats.pending_interventions || 0}
            </div>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #52c41a' }}>
            <div className="stat-label">💵 待结算金额</div>
            <div className="stat-value" style={{ color: '#52c41a' }}>
              {formatMoney(stats.pending_settle_amount || 0)}
            </div>
          </div>
        </div>

        <div className="detail-section">
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

        <div className="detail-section">
          <div className="detail-section-title">合同状态分布</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {Object.entries(stats.contractStats || {}).map(([k, v]) => (
              <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <ContractStatusTag status={k} /> <span style={{ fontSize: 13, color: '#666' }}>{v} 份</span>
              </span>
            ))}
          </div>
        </div>

        <div className="detail-section">
          <div className="detail-section-title">付款节点分布</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {Object.entries(stats.paymentStats || {}).map(([k, v]) => (
              <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <PaymentStatusTag status={k} /> <span style={{ fontSize: 13, color: '#666' }}>{v} 笔</span>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 12, fontSize: 13, color: '#666' }}>
            <span>📦 托管中金额：<b style={{ color: '#1890ff' }}>{formatMoney(stats.escrowed_amount || 0)}</b></span>
            <span>💵 待结算金额：<b style={{ color: '#52c41a' }}>{formatMoney(stats.pending_settle_amount || 0)}</b></span>
            <span>✅ 已结算金额：<b style={{ color: '#667eea' }}>{formatMoney(stats.settled_amount || 0)}</b></span>
            <span>↩️ 已退款金额：<b style={{ color: '#ff4d4f' }}>{formatMoney(stats.refunded_amount || 0)}</b></span>
          </div>
        </div>

        <div className="detail-section">
          <div className="detail-section-title">平台介入分布</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {Object.entries(stats.interventionStats || {}).map(([k, v]) => (
              <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <InterventionStatusTag status={k} /> <span style={{ fontSize: 13, color: '#666' }}>{v} 单</span>
              </span>
            ))}
          </div>
        </div>

        <div className="detail-section">
          <div className="detail-section-title">业务操作记录</div>
          <div style={{ fontSize: 14, color: '#666' }}>累计 {stats.total_records} 条操作记录</div>
        </div>
      </div>

      <div className="page-card">
        <div className="page-title">
          <span>快速入口（{ROLE_LABELS[state.currentRole]}视角）</span>
          <Link to="/roles" className="btn btn-default btn-sm">切换角色</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 16 }}>
          {roleCards[state.currentRole].map((c) => (
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

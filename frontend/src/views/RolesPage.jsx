import React from 'react'
import { useNavigate } from 'react-router-dom'
import { store, ROLES, ROLE_LABELS } from '../store/localStore.js'
import { useToast } from '../context/ToastContext.jsx'

export default function RolesPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [, force] = React.useReducer((x) => x + 1, 0)
  React.useEffect(() => store.subscribe(() => force()), [])
  const state = store.getState()

  const roleDescs = {
    [ROLES.USER]: {
      icon: '👤',
      desc: '发布用工需求，查看推荐服务商，下单并跟踪订单进度',
      features: ['发布用工需求', '查看撮合推荐', '发起下单', '跟踪订单状态', '取消订单'],
      cannot: ['接单/开始/完成服务', '提交实名认证', '审核认证申请', '标记/处理异常']
    },
    [ROLES.PROVIDER]: {
      icon: '👷',
      desc: '入驻平台、完善资料、提交认证、接单并提供服务',
      features: ['服务商入驻', '编辑个人资料', '提交实名认证', '查看/接单订单', '开始/完成服务', '标记订单异常'],
      cannot: ['发布需求/下单', '审核认证申请', '处理异常（恢复服务）']
    },
    [ROLES.ADMIN]: {
      icon: '🛠️',
      desc: '平台运营管理：审核认证、监控订单、处理异常状态',
      features: ['查看数据看板', '审核实名认证', '监控全部订单', '处理异常恢复服务', '标记订单异常', '取消任意订单'],
      cannot: ['发布需求/下单（用户操作）']
    }
  }

  const selectRole = (r) => {
    store.setRole(r)
    toast.success(`已切换至${ROLE_LABELS[r]}，请在顶部导航或下方卡片选择要操作的模块`)
  }

  return (
    <div>
      <div className="page-card" style={{ marginBottom: 16 }}>
        <div className="page-title">
          <span>🎭 角色工作台</span>
          <span style={{ fontSize: 13, color: '#999', fontWeight: 'normal' }}>
            当前视角：<strong style={{ color: '#667eea' }}>{ROLE_LABELS[state.currentRole]}</strong>
          </span>
        </div>
        <p style={{ color: '#666', marginBottom: 16 }}>
          不同角色拥有不同的操作权限，切换后页面按钮和可执行操作会相应变化。
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {Object.entries(roleDescs).map(([r, info]) => (
          <div
            key={r}
            className="provider-card"
            style={{
              borderTop: `3px solid ${state.currentRole === r ? '#667eea' : '#e8e8e8'}`,
              background: state.currentRole === r ? '#f7f9ff' : '#fff',
              cursor: 'pointer'
            }}
            onClick={() => selectRole(r)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 32 }}>{info.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 600, marginTop: 8 }}>{ROLE_LABELS[r]}</div>
              </div>
              {state.currentRole === r && <span className="tag">当前</span>}
            </div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>{info.desc}</div>
            <div style={{ fontSize: 13, color: '#333' }}>
              <div style={{ fontWeight: 500, marginBottom: 6 }}>✅ 可执行操作：</div>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {info.features.map((f, i) => <li key={i} style={{ marginBottom: 2, color: '#52c41a' }}>{f}</li>)}
              </ul>
            </div>
            <div style={{ fontSize: 13, color: '#999', marginTop: 8 }}>
              <div style={{ fontWeight: 500, marginBottom: 6 }}>🚫 无权限操作：</div>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {info.cannot.map((f, i) => <li key={i} style={{ marginBottom: 2, color: '#ff4d4f' }}>{f}</li>)}
              </ul>
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button className={`btn ${state.currentRole === r ? 'btn-default' : 'btn-primary'} btn-sm`}>
                {state.currentRole === r ? '使用中' : '切换到此角色'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="page-card" style={{ marginTop: 16 }}>
        <div className="page-title"><span>常见复查路径推荐</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 12 }}>
          {[
            { to: '/providers', label: '服务商列表', icon: '👷' },
            { to: '/auth', label: '实名认证页', icon: '🆔' },
            { to: '/demands', label: '需求发布页', icon: '📋' },
            { to: '/matches', label: '撮合推荐结果', icon: '🤝' },
            { to: '/orders', label: '订单列表/详情', icon: '📦' },
          ].map((l) => (
            <button key={l.to} className="btn btn-default" onClick={() => navigate(l.to)}>
              {l.icon} {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { NavLink } from 'react-router-dom'
import { store, ROLE_LABELS, ROLES } from '../store/localStore.js'
import { useToast } from '../context/ToastContext.jsx'

const NAV_ITEMS = [
  { path: '/', label: '首页', icon: '🏠', end: true },
  { path: '/providers', label: '服务商', icon: '👷', end: false },
  { path: '/auth', label: '实名认证', icon: '🆔', end: false },
  { path: '/demands', label: '用工需求', icon: '📋', end: false },
  { path: '/matches', label: '撮合推荐', icon: '🤝', end: false },
  { path: '/orders', label: '订单管理', icon: '📦', end: false },
  { path: '/roles', label: '角色切换', icon: '🎭', end: false },
]

export default function StableLayout({ children }) {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0)
  const toast = useToast()

  React.useEffect(() => {
    const unsubscribe = store.subscribe(() => forceUpdate())
    return () => unsubscribe()
  }, [])

  const state = store.getState()

  const handleSwitchRole = React.useCallback((roleKey) => {
    store.setRole(roleKey)
    toast.success(`已切换至${ROLE_LABELS[roleKey]}`)
  }, [toast])

  return (
    <div className="app-layout" style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <header
        className="app-header"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>🏠 家政中介服务平台</h1>
          <span
            style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '4px 12px',
              borderRadius: 16,
              fontSize: 13,
            }}
          >
            当前视角：{ROLE_LABELS[state.currentRole]}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(ROLE_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleSwitchRole(key)}
              style={{
                padding: '6px 16px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                background: state.currentRole === key ? '#fff' : 'rgba(255,255,255,0.2)',
                color: state.currentRole === key ? '#667eea' : '#fff',
                transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <nav
        className="app-nav"
        style={{
          background: '#fff',
          padding: '0 24px',
          borderBottom: '1px solid #e8e8e8',
          display: 'flex',
          gap: 4,
          flexWrap: 'wrap',
          overflowX: 'auto',
        }}
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            style={({ isActive }) => ({
              padding: '14px 18px',
              textDecoration: 'none',
              fontSize: 14,
              color: isActive ? '#667eea' : '#666',
              borderBottom: isActive ? '2px solid #667eea' : '2px solid transparent',
              marginBottom: '-1px',
              fontWeight: isActive ? 600 : 400,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            })}
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main
        className="app-main"
        style={{
          padding: 24,
          maxWidth: 1400,
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </main>

      <footer
        style={{
          textAlign: 'center',
          padding: '24px',
          color: '#999',
          fontSize: 12,
          borderTop: '1px solid #e8e8e8',
          marginTop: 24,
        }}
      >
        家政中介服务平台 © 2026 · 演示版本 · 本地数据存储于 localStorage
      </footer>
    </div>
  )
}

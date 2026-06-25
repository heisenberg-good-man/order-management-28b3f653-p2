import React from 'react'
import { NavLink } from 'react-router-dom'
import AppRouter from './router/index.jsx'
import { useToast, ToastProvider } from './context/ToastContext.jsx'
import { store, ROLE_LABELS, ROLES } from './store/localStore.js'

const NAVS = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/providers', label: '服务商', icon: '👷' },
  { path: '/auth', label: '实名认证', icon: '🆔' },
  { path: '/demands', label: '用工需求', icon: '📋' },
  { path: '/matches', label: '撮合推荐', icon: '🤝' },
  { path: '/orders', label: '订单管理', icon: '📦' },
  { path: '/contracts', label: '合同协议', icon: '📝' },
  { path: '/payments', label: '担保付款', icon: '💰' },
  { path: '/interventions', label: '平台介入', icon: '⚖️' },
  { path: '/roles', label: '角色切换', icon: '🎭' },
]

function Layout() {
  const [tick, setTick] = React.useReducer((x) => x + 1, 0)
  React.useEffect(() => store.subscribe(() => setTick()), [])
  const state = store.getState()
  const toast = useToast()

  const switchRole = (r) => {
    store.setRole(r)
    toast.success(`已切换至${ROLE_LABELS[r]}`)
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 20 }}>🏠 家政中介服务平台</h1>
          <span className="tag" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
            当前视角：{ROLE_LABELS[state.currentRole]}
          </span>
        </div>
        <div className="role-switcher">
          {Object.entries(ROLE_LABELS).map(([k, v]) => (
            <button
              key={k}
              className={`role-btn ${state.currentRole === k ? 'active' : ''}`}
              onClick={() => switchRole(k)}
            >
              {v}
            </button>
          ))}
        </div>
      </header>
      <nav className="app-nav">
        {NAVS.map((n) => (
          <NavLink
            key={n.path}
            to={n.path}
            end={n.path === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span style={{ marginRight: 4 }}>{n.icon}</span>{n.label}
          </NavLink>
        ))}
      </nav>
      <main className="app-main">
        <AppRouter />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <Layout />
    </ToastProvider>
  )
}

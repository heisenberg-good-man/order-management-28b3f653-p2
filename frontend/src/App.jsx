import React from 'react'
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { RoleProvider, useRole, ROLES, ROLE_LABELS } from './context/RoleContext'

import UserDemandList from './pages/user/DemandList'
import UserPublishDemand from './pages/user/PublishDemand'
import UserMatchResult from './pages/user/MatchResult'
import UserOrderList from './pages/user/OrderList'
import UserOrderDetail from './pages/user/OrderDetail'

import ProviderList from './pages/provider/ProviderList'
import ProviderRegister from './pages/provider/ProviderRegister'
import ProviderProfile from './pages/provider/ProviderProfile'
import ProviderAuth from './pages/provider/ProviderAuth'
import ProviderOrderList from './pages/provider/OrderList'
import ProviderOrderDetail from './pages/provider/OrderDetail'

import AdminDashboard from './pages/admin/Dashboard'
import AdminProviderList from './pages/admin/ProviderList'
import AdminOrderList from './pages/admin/OrderList'

function getDefaultPath(role) {
  if (role === ROLES.USER) return '/user/demands'
  if (role === ROLES.PROVIDER) return '/provider/list'
  return '/admin/dashboard'
}

function RoleSwitcher() {
  const { role, setRole } = useRole()
  const navigate = useNavigate()

  const handleSwitch = (newRole) => {
    setRole(newRole)
    navigate(getDefaultPath(newRole))
  }

  return (
    <div className="role-switcher">
      {Object.entries(ROLE_LABELS).map(([key, label]) => (
        <button
          key={key}
          className={`role-btn ${role === key ? 'active' : ''}`}
          onClick={() => handleSwitch(key)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function NavBar() {
  const { role } = useRole()

  const userNavs = [
    { path: '/user/demands', label: '用工需求' },
    { path: '/user/demands/publish', label: '发布需求' },
    { path: '/user/orders', label: '我的订单' },
  ]
  const providerNavs = [
    { path: '/provider/list', label: '服务商列表' },
    { path: '/provider/register', label: '服务商入驻' },
    { path: '/provider/profile', label: '资料编辑' },
    { path: '/provider/auth', label: '实名认证' },
    { path: '/provider/orders', label: '订单管理' },
  ]
  const adminNavs = [
    { path: '/admin/dashboard', label: '数据看板' },
    { path: '/admin/providers', label: '服务商管理' },
    { path: '/admin/orders', label: '订单监控' },
  ]

  const navs = role === ROLES.USER ? userNavs : role === ROLES.PROVIDER ? providerNavs : adminNavs

  return (
    <nav className="app-nav">
      {navs.map((n) => (
        <NavLink
          key={n.path}
          to={n.path}
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          {n.label}
        </NavLink>
      ))}
    </nav>
  )
}

function RoleRoutes() {
  const { role } = useRole()
  const defaultPath = getDefaultPath(role)

  return (
    <Routes>
      <Route path="/" element={<Navigate to={defaultPath} replace />} />

      <Route path="/user/demands" element={<UserDemandList />} />
      <Route path="/user/demands/publish" element={<UserPublishDemand />} />
      <Route path="/user/demands/:id/match" element={<UserMatchResult />} />
      <Route path="/user/orders" element={<UserOrderList />} />
      <Route path="/user/orders/:id" element={<UserOrderDetail />} />

      <Route path="/provider/list" element={<ProviderList />} />
      <Route path="/provider/register" element={<ProviderRegister />} />
      <Route path="/provider/profile" element={<ProviderProfile />} />
      <Route path="/provider/auth" element={<ProviderAuth />} />
      <Route path="/provider/orders" element={<ProviderOrderList />} />
      <Route path="/provider/orders/:id" element={<ProviderOrderDetail />} />

      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/providers" element={<AdminProviderList />} />
      <Route path="/admin/orders" element={<AdminOrderList />} />

      <Route path="*" element={<Navigate to={defaultPath} replace />} />
    </Routes>
  )
}

function AppContent() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>🏠 家政中介服务平台</h1>
        <RoleSwitcher />
      </header>
      <NavBar />
      <main className="app-main">
        <RoleRoutes />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <RoleProvider>
        <AppContent />
      </RoleProvider>
    </ToastProvider>
  )
}

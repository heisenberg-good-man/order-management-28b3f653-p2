import React from 'react'
import { Routes, Route } from 'react-router-dom'

import HomePage from '../views/Home.jsx'
import ProviderListPage from '../views/ProviderList.jsx'
import ProviderDetailPage from '../views/ProviderDetail.jsx'
import AuthPage from '../views/AuthPage.jsx'
import DemandsPage from '../views/DemandsPage.jsx'
import MatchesPage from '../views/MatchesPage.jsx'
import OrdersPage from '../views/OrdersPage.jsx'
import OrderDetailPage from '../views/OrderDetail.jsx'
import RolesPage from '../views/RolesPage.jsx'
import NotFoundPage from '../views/NotFound.jsx'

export default function StableRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/providers" element={<ProviderListPage />} />
      <Route path="/providers/:id" element={<ProviderDetailPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/demands" element={<DemandsPage />} />
      <Route path="/matches" element={<MatchesPage />} />
      <Route path="/matches/:demandId" element={<MatchesPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/orders/:id" element={<OrderDetailPage />} />
      <Route path="/roles" element={<RolesPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

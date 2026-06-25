import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '../views/Home.jsx'
import ProviderList from '../views/ProviderList.jsx'
import ProviderDetail from '../views/ProviderDetail.jsx'
import AuthPage from '../views/AuthPage.jsx'
import DemandsPage from '../views/DemandsPage.jsx'
import MatchesPage from '../views/MatchesPage.jsx'
import OrdersPage from '../views/OrdersPage.jsx'
import OrderDetail from '../views/OrderDetail.jsx'
import ContractsPage from '../views/ContractsPage.jsx'
import PaymentsPage from '../views/PaymentsPage.jsx'
import InterventionsPage from '../views/InterventionsPage.jsx'
import RolesPage from '../views/RolesPage.jsx'
import NotFound from '../views/NotFound.jsx'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/providers" element={<ProviderList />} />
      <Route path="/providers/:id" element={<ProviderDetail />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/demands" element={<DemandsPage />} />
      <Route path="/matches" element={<MatchesPage />} />
      <Route path="/matches/:demandId" element={<MatchesPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/orders/:id" element={<OrderDetail />} />
      <Route path="/contracts" element={<ContractsPage />} />
      <Route path="/payments" element={<PaymentsPage />} />
      <Route path="/interventions" element={<InterventionsPage />} />
      <Route path="/roles" element={<RolesPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

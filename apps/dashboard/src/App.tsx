import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/auth'
import MainLayout from './components/layout/MainLayout'
import LoginPage from './pages/login'
import DashboardPage from './pages/dashboard'
import MerchantsPage from './pages/merchants'
import MerchantDetailPage from './pages/merchants/detail'
import OrdersPage from './pages/orders'
import UsersPage from './pages/users'
import ProductsPage from './pages/products'
import MarketingPage from './pages/marketing'
import SettingsPage from './pages/settings'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="merchants" element={<MerchantsPage />} />
        <Route path="merchants/:id" element={<MerchantDetailPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="marketing" element={<MarketingPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

export default App

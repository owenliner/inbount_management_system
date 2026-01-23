import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import MainLayout from './components/Layout/MainLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import WarehouseList from './pages/Warehouse/WarehouseList'
import StockList from './pages/Stock/StockList'
import StockDetail from './pages/Stock/StockDetail'
import InboundList from './pages/Inbound/InboundList'
import InboundCreate from './pages/Inbound/InboundCreate'
import ConsumableTypeList from './pages/ConsumableType/ConsumableTypeList'
import UnitList from './pages/Unit/UnitList'
import PurchaseRequestList from './pages/Purchase/PurchaseRequestList'
import GoodsRequestList from './pages/GoodsRequest/GoodsRequestList'
import BulletinList from './pages/Bulletin/BulletinList'
import UserList from './pages/User/UserList'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="warehouses" element={<WarehouseList />} />
        <Route path="stock" element={<StockList />} />
        <Route path="stock/detail" element={<StockDetail />} />
        <Route path="inbound" element={<InboundList />} />
        <Route path="inbound/create" element={<InboundCreate />} />
        <Route path="consumable-types" element={<ConsumableTypeList />} />
        <Route path="units" element={<UnitList />} />
        <Route path="purchase-requests" element={<PurchaseRequestList />} />
        <Route path="goods-requests" element={<GoodsRequestList />} />
        <Route path="bulletins" element={<BulletinList />} />
        <Route path="users" element={<UserList />} />
      </Route>
    </Routes>
  )
}

export default App

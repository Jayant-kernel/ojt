/**
 * App root — React Router v6 layout with protected routes.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'

import Login      from './pages/Login'
import Dashboard  from './pages/Dashboard'
import Products   from './pages/Products'
import Sales      from './pages/Sales'
import Forecast   from './pages/Forecast'
import Alerts     from './pages/Alerts'
import Categories from './pages/Categories'
import Suppliers  from './pages/Suppliers'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index         element={<Dashboard />} />
            <Route path="products"   element={<Products />} />
            <Route path="sales"      element={<Sales />} />
            <Route path="forecast"   element={<Forecast />} />
            <Route path="alerts"     element={<Alerts />} />
            <Route path="categories" element={<Categories />} />
            <Route path="suppliers"  element={<Suppliers />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Toast notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#161B25',
            border: '1px solid #2A3347',
            color: '#CBD5E1',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '12px',
          },
          success: { iconTheme: { primary: '2596be', secondary: '#080A0E' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: '#080A0E' } },
        }}
      />
    </AuthProvider>
  )
}

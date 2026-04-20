import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MenuPage from './pages/MenuPage';
import OrderTracking from './pages/OrderTracking';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import KitchenDashboard from './pages/KitchenDashboard';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoutes';

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/kitchen" element={<KitchenDashboard />} />
          <Route path="/track-order/:orderId" element={<OrderTracking />} />
          <Route 
            path="/admin/dashboard" 
            element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
            } 
          />
          <Route 
            path="/kitchen" 
            element={
            <ProtectedRoute allowedRoles={['admin', 'kitchen']}>
              <KitchenDashboard />
            </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;

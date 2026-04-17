import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MenuPage from './pages/MenuPage';
import OrderTracking from './pages/OrderTracking';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import KitchenDashboard from './pages/KitchenDashboard';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/kitchen" element={<KitchenDashboard />} />
          <Route path="/track-order/:orderId" element={<OrderTracking />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

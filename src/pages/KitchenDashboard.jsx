import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Clock, CheckCircle2, Flame, Bell, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';
const socket = io(API_URL || window.location.origin);

const KitchenDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('adminToken');
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchOrders();

    socket.on('newOrder', (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
      // Play a sound or notification here if desired
      if (Notification.permission === 'granted') {
        new Notification('New Order Received!', { body: `Table ${newOrder.tableId} placed an order.` });
      }
    });

    return () => socket.off('newOrder');
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/orders`, authConfig);
      // Filter out 'Served' orders for the kitchen view, or just show them at the bottom
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/orders/${orderId}/status`, { status: newStatus }, authConfig);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Preparing': return 'bg-rose-100 text-rose-600 border-rose-200';
      case 'Prepared': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'Delivered': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getNextStatus = (status) => {
    if (status === 'Preparing') return 'Prepared';
    if (status === 'Prepared') return 'Delivered';
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900">Kitchen Display</h1>
          <p className="text-slate-500">Real-time order processing center</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            <span className="font-bold text-slate-700">Live Connection</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Syncing with kitchen...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {orders.map(order => (
            <div
              key={order._id}
              className={`bg-white rounded-[2.5rem] border-2 transition-all p-8 flex flex-col ${order.status === 'Delivered' ? 'opacity-60 border-transparent shadow-none' : 'border-slate-100 shadow-xl shadow-slate-200/50'
                }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Table {order.tableId}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">#{order._id.slice(-6)}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl text-slate-700">
                    <span className="font-bold">{item.name} <span className="text-primary-500 ml-1">x{item.quantity}</span></span>
                    {order.status === 'Preparing' && <Flame className="w-4 h-4 text-orange-500" />}
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {order.paymentStatus === 'Paid' ? (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">PAID</span>
                ) : (
                  <span className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-lg">UNPAID</span>
                )}
              </div>

              {getNextStatus(order.status) && (
                <button
                  onClick={() => updateStatus(order._id, getNextStatus(order.status))}
                  className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-primary-600 transition-all active:scale-[0.98]"
                >
                  Mark as {getNextStatus(order.status)}
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KitchenDashboard;

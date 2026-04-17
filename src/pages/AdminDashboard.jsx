import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Plus, Search, Edit2, Trash2, Power, DollarSign,
  ShoppingBag, Star, RefreshCw, Upload, Link, Image, X, LogOut, IndianRupee
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || '';

const AdminDashboard = () => {
  const [menu, setMenu] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', price: '', category: 'Starters', description: '', image: '' });
  const [imageMode, setImageMode] = useState('url'); // 'url' or 'file'
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('adminToken');
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/api/menu`),
        axios.get(`${API_URL}/api/orders/stats`, authConfig)
      ]);
      setMenu(menuRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItem({ ...newItem, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/menu`, newItem, authConfig);
      setShowAddModal(false);
      setNewItem({ name: '', price: '', category: 'Starters', description: '', image: '' });
      fetchData();
    } catch (error) {
      alert('Error adding item');
    }
  };

  const deleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await axios.delete(`${API_URL}/api/menu/${id}`, authConfig);
      fetchData();
    }
  };

  const toggleItem = async (id) => {
    await axios.patch(`${API_URL}/api/menu/${id}/toggle`, {}, authConfig);
    fetchData();
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  // Mock data for chart based on menu categories
  const chartData = menu.reduce((acc, item) => {
    const existing = acc.find(a => a.name === item.category);
    if (existing) existing.count += 1;
    else acc.push({ name: item.category, count: 1 });
    return acc;
  }, []);

  const COLORS = ['#f43f5e', '#fb7185', '#fda4af', '#be123c', '#9f1239'];

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Business overview and management</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={fetchData}
            className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-6 h-6 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-700 shadow-lg shadow-primary-100 transition-all"
          >
            <Plus className="w-5 h-5" /> Add New Item
          </button>
          <button
            onClick={handleLogout}
            className="p-3 bg-white border border-rose-100 text-rose-500 rounded-2xl hover:bg-rose-50 transition-colors shadow-sm"
            title="Logout"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center">
            <IndianRupee className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-500 font-medium">Total Revenue</p>
            <h3 className="text-3xl font-black text-slate-900">₹{stats.totalRevenue}</h3>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-500 font-medium">Total Orders</p>
            <h3 className="text-3xl font-black text-slate-900">{stats.totalOrders}</h3>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center">
            <Star className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-500 font-medium">Menu Items</p>
            <h3 className="text-3xl font-black text-slate-900">{menu.length}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category distribution chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold mb-8">Menu Composition</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[8, 8, 8, 8]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Menu Management List */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-[400px] flex flex-col">
          <h2 className="text-xl font-bold mb-6">Recent Items</h2>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {menu.slice().reverse().map(item => (
              <div key={item._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-4">
                  <img src={item.image} alt="" className="w-14 h-14 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-bold text-slate-900">{item.name}</h4>
                    <span className="text-xs bg-white px-2 py-0.5 rounded-full border text-slate-500 font-medium">{item.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleItem(item._id)}
                    className={`p-2 rounded-xl border transition-colors ${item.isAvailable ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-slate-400 bg-white border-slate-200'}`}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteItem(item._id)}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Item Modal Placeholder (Simplified state-based) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 relative animate-in fade-in zoom-in duration-300">
            <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600">
              <Plus className="w-8 h-8 rotate-45" />
            </button>
            <h2 className="text-3xl font-extrabold mb-8">Add Item</h2>
            <form onSubmit={addItem} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-2">Name</label>
                <input
                  autoFocus
                  className="w-full bg-slate-50 py-4 px-6 rounded-2xl outline-none border focus:border-primary-500"
                  value={newItem.name}
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-2">Price (₹)</label>
                  <input
                    type="number"
                    className="w-full bg-slate-50 py-4 px-6 rounded-2xl outline-none border focus:border-primary-500"
                    value={newItem.price}
                    onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-2">Category</label>
                  <select
                    className="w-full bg-slate-50 py-4 px-6 rounded-2xl outline-none border focus:border-primary-500 appearance-none"
                    value={newItem.category}
                    onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                  >
                    <option>Starters</option>
                    <option>Main Course</option>
                    <option>Desserts</option>
                    <option>Beverages</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center ml-2">
                  <label className="text-sm font-bold text-slate-700">Image</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${imageMode === 'url' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500'}`}
                    >
                      <Link className="w-3.5 h-3.5" /> URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('file')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${imageMode === 'file' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500'}`}
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    {imageMode === 'url' ? (
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-slate-50 py-4 px-6 rounded-2xl outline-none border focus:border-primary-500 transition-all"
                        value={newItem.image}
                        onChange={e => setNewItem({ ...newItem, image: e.target.value })}
                      />
                    ) : (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full bg-slate-50 py-4 px-6 rounded-2xl border border-dashed border-slate-300 flex items-center justify-center gap-3 text-slate-500">
                          <Image className="w-5 h-5" />
                          <span className="font-medium text-sm">Click to choose image</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {newItem.image && (
                    <div className="w-14 h-14 rounded-xl border border-slate-100 overflow-hidden shrink-0 shadow-sm animate-in fade-in zoom-in group relative">
                      <img src={newItem.image} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewItem({ ...newItem, image: '' })}
                        className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-2">Description</label>
                <textarea
                  className="w-full bg-slate-50 py-4 px-6 rounded-2xl outline-none border focus:border-primary-500 h-24 resize-none"
                  value={newItem.description}
                  onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                />
              </div>
              <button className="w-full bg-primary-600 text-white py-5 rounded-[2rem] font-bold text-lg hover:bg-primary-700 transition-all shadow-xl shadow-primary-100">
                Confirm & Add
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

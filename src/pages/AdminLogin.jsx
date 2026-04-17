import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, User, LogIn, ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/login`, { username, password });
      localStorage.setItem('adminToken', data.token);
      navigate('/admin/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-20">
      <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200 border border-slate-100">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-200 rotate-3">
            <Lock className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Admin Portal</h1>
          <p className="text-slate-500 mt-2">Manage your restaurant efficiently</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-2">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white outline-none py-4 pl-12 pr-6 rounded-2xl font-medium transition-all"
                placeholder="admin"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-600 focus:bg-white outline-none py-4 pl-12 pr-6 rounded-2xl font-medium transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 shadow-lg shadow-primary-200 active:scale-[0.98] transition-all mt-4"
          >
            <LogIn className="w-5 h-5" />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center">
          <p className="text-slate-400 text-sm mb-4">Not an admin?</p>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-primary-600 font-bold hover:text-primary-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Move to main menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

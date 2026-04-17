import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ShoppingCart, Table, Plus, Minus, X,
  History, Truck, AlertCircle, Clock, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || '';
const socket = io(API_URL || window.location.origin);

const MenuPage = () => {
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState(['All', 'Starters', 'Main Course', 'Desserts', 'Beverages']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [tableId, setTableId] = useState(localStorage.getItem('tableId') || '');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [pastOrders, setPastOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentDropdownId, setPaymentDropdownId] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/menu`);
        setMenu(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching menu:', error);
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  useEffect(() => {
    localStorage.setItem('tableId', tableId);
    if (tableId) {
      fetchPastOrders();
    }

    const handleStatusUpdate = (updatedOrder) => {
      setPastOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    };

    socket.on('orderStatusUpdated', handleStatusUpdate);
    return () => socket.off('orderStatusUpdated');
  }, [tableId]);

  const fetchPastOrders = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/orders/table/${tableId}`);
      setPastOrders(data);
    } catch (error) {
      console.error('Error fetching past orders:', error);
    }
  };

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === item._id);
      if (existing) {
        return prev.map((i) => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === itemId);
      if (existing.quantity === 1) {
        return prev.filter((i) => i._id !== itemId);
      }
      return prev.map((i) => i._id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const placeOrder = async () => {
    if (!tableId) return alert('Please enter your Table ID');
    if (cart.length === 0) return alert('Your cart is empty');

    try {
      const { data } = await axios.post(`${API_URL}/api/orders`, {
        tableId,
        items: cart.map(item => ({
          menuItem: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount
      });
      alert('Order placed successfully!');
      setCart([]);
      setIsCartOpen(false);
      setIsHistoryOpen(true);
      fetchPastOrders();
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  

  const filteredMenu = activeCategory === 'All'
    ? menu
    : menu.filter(item => item.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header & Table Input */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Deliciously Yours</h1>
          <p className="text-slate-500">Scan, Order, and Relax.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-sm border text-slate-600 font-bold hover:bg-slate-50 transition-all active:scale-95"
          >
            <History className="w-5 h-5 text-primary-500" />
            Your Orders
            {pastOrders.length > 0 && (
              <span className="bg-primary-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {pastOrders.filter(o => o.status !== 'Delivered').length}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border">
            <Table className="w-5 h-5 text-primary-500 ml-2" />
            <input
              type="text"
              placeholder="Table ID"
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
              className="outline-none py-2 px-1 w-24 font-medium text-center"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2.5 rounded-full font-semibold transition-all whitespace-nowrap ${activeCategory === cat
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
              : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading menu...</div>
      ) : filteredMenu.length === 0 ? (
        <div className="text-center py-24 bg-white/50 rounded-[3rem] border-2 border-dashed border-slate-200 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Plus className="w-10 h-10 rotate-45" />
          </div>
          <h3 className="text-2xl font-bold text-slate-400 uppercase tracking-wider">No food items available</h3>
          <p className="text-slate-400 mt-2 font-medium">Coming soon in the {activeCategory} section!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMenu.map(item => (
            <div key={item._id} className="bg-white rounded-3xl overflow-hidden card-hover border border-slate-100 flex flex-col">
              <div className="h-48 relative overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-white text-black px-4 py-1 rounded-full font-bold">Sold Out</span>
                  </div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-slate-900">{item.name}</h3>
                  <span className="text-lg font-bold text-primary-600">₹{item.price}</span>
                </div>
                <p className="text-slate-500 text-sm mb-6 flex-1">{item.description}</p>
                <button
                  disabled={!item.isAvailable}
                  onClick={() => addToCart(item)}
                  className={`w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${item.isAvailable
                    ? 'bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                >
                  <Plus className="w-5 h-5" /> Add to Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order History Drawer */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-screen shadow-2xl flex flex-col pt-6 animate-slide-left">
            <div className="px-6 flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <History className="w-6 h-6 text-primary-500" /> Order History
              </h2>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 space-y-6">
              {pastOrders.length === 0 ? (
                <div className="text-center py-20">
                  <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">No order history for Table {tableId || '?'}</p>
                </div>
              ) : (
                pastOrders.map(order => (
                  <div key={order._id} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-slate-400 font-mono">#{order._id.slice(-6).toUpperCase()}</p>
                        <p className="font-bold text-slate-900">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${order.status === 'Preparing' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                        order.status === 'Prepared' ? 'bg-amber-50 text-amber-500 border-amber-100' :
                          'bg-emerald-50 text-emerald-500 border-emerald-100'
                        }`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-slate-600">{item.name} <span className="text-slate-400 text-xs">x{item.quantity}</span></span>
                          <span className="font-bold text-slate-900">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold">Total Amount</span>
                        <span className="text-lg font-black text-primary-600">₹{order.totalAmount}</span>
                      </div>

                      {/* Payment Section */}
                      <div className="mt-4">
                        {order.paymentStatus === 'Paid' ? (
                          <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Payment Success</span>
                          </div>
                        ) : order.paymentStatus === 'Failed' ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-rose-600 font-bold bg-rose-50 p-3 rounded-xl border border-rose-100">
                              <AlertCircle className="w-5 h-5" />
                              <span>Payment failed try again</span>
                            </div>
                            <button
                              onClick={() => {
                                navigate(`/track-order/${order._id}`);
                              }}
                              className="w-full py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-md shadow-primary-200"
                            >
                              Retry Payment
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <button
                              onClick={() => setPaymentDropdownId(paymentDropdownId === order._id ? null : order._id)}
                              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                            >
                              Payment
                            </button>

                            {paymentDropdownId === order._id && (
                              <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in slide-in-from-bottom-2 duration-200">
                                <button
                                  onClick={() => {
                                    alert("Pay your cash at billing counter.");
                                    setPaymentDropdownId(null);
                                  }}
                                  className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 text-slate-700 font-bold transition-all border-b border-slate-50"
                                >
                                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                    ₹
                                  </div>
                                  Pay via cash
                                </button>
                                <button
                                  onClick={() => {
                                    navigate(`/track-order/${order._id}`);
                                    setPaymentDropdownId(null);
                                  }}
                                  className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 text-slate-700 font-bold transition-all"
                                >
                                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <ShoppingCart className="w-4 h-4" />
                                  </div>
                                  Pay online
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Live Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        <span className={order.status === 'Preparing' ? 'text-primary-500' : ''}>Preparing</span>
                        <span className={order.status === 'Prepared' ? 'text-primary-500' : ''}>Prepared</span>
                        <span className={order.status === 'Delivered' ? 'text-primary-500' : ''}>Delivered</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-1000"
                          style={{
                            width: order.status === 'Preparing' ? '33.3%' :
                              order.status === 'Prepared' ? '66.6%' : '100%',
                            background: 'linear-gradient(to right, #ef4444, #f97316, #f59e0b, #22c55e)',
                            backgroundSize: '100% 100%'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Cart Button (Mobile) & Cart Sidebar */}
      {cart.length > 0 && (
        <>
          <button
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-8 right-8 bg-primary-600 text-white p-5 rounded-full shadow-2xl z-40 lg:flex items-center gap-3 active:scale-95 transition-transform"
          >
            <ShoppingCart className="w-7 h-7" />
            <span className="bg-white text-primary-600 w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm">
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </span>
          </button>

          {/* Cart Sidebar Overlay */}
          {isCartOpen && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end">
              <div className="w-full max-w-md bg-white h-screen shadow-2xl flex flex-col pt-6 animate-slide-left">
                <div className="px-6 flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold">Your Order</h2>
                  <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6">
                  {cart.map(item => (
                    <div key={item._id} className="flex gap-4 mb-6 pb-6 border-bottom border-slate-100">
                      <img src={item.image} alt="" className="w-20 h-20 rounded-2xl object-cover" />
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900">{item.name}</h4>
                        <p className="text-primary-600 font-bold mb-2">₹{item.price}</p>
                        <div className="flex items-center gap-4">
                          <button onClick={() => removeFromCart(item._id)} className="p-1.5 bg-slate-100 rounded-lg hover:bg-slate-200">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold">{item.quantity}</span>
                          <button onClick={() => addToCart(item)} className="p-1.5 bg-slate-100 rounded-lg hover:bg-slate-200">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-slate-500 font-medium text-lg">Subtotal</span>
                    <span className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={placeOrder}
                    className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
                  >
                    Place Order (Table {tableId || '?'})
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MenuPage;

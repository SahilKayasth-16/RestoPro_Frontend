import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { CheckCircle2, Circle, Clock, Check, Download, CreditCard } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const socket = io(API_URL);

const OrderTracking = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/orders/${orderId}`);
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
      }
    };

    fetchOrder();

    socket.on('orderStatusUpdated', (updatedOrder) => {
      if (updatedOrder._id === orderId) {
        setOrder(updatedOrder);
      }
    });

    socket.on('paymentSuccess', ({ orderId: paidOrderId }) => {
      if (paidOrderId === orderId) {
        setOrder(prev => ({
          ...prev,
          paymentStatus: 'Paid'
        }));
      }
    });

    return () => {
      socket.off('orderStatusUpdated');
      socket.off('paymentSuccess');
    };

  }, [orderId]);

  const downloadBill = () => {
    window.open(`${API_URL}/api/orders/${orderId}/bill`, '_blank');
  };

  const handlePayment = async () => {
    if (paymentLoading) return; 

    try {
      setPaymentLoading(true);

      // Step 1: Create order from backend
      const { data } = await axios.post(`${API_URL}/api/payment/create-order/${order._id}`);

      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded");
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: data.amount,
        currency: "INR",
        name: "Restaurant Pro",
        description: "Order Payment",
        order_id: data.razorpayOrderId,

        handler: async function (response) {
          // Step 2: Verify payment
          await axios.post(`${API_URL}/api/payment/verify`, {
            ...response,
            orderId: order._id
          });

          alert("Payment Successful!");

          setOrder(prev => ({
            ...prev,
            paymentStatus: 'Paid'
          }));
        },

        prefill: {
          name: "Customer",
        },

        theme: {
          color: "#0f172a"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      alert("Payment Failed");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (!order) return <div className="text-center py-20 text-slate-400">Loading order details...</div>;

  const stepColors = ['#ef4444', '#f97316', '#f59e0b', '#22c55e'];
  const steps = ['Pending', 'Preparing', 'Ready', 'Served'];
  const currentStepIndex = steps.indexOf(order.status);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="glass-morphism rounded-3xl p-8 mb-8 text-center bg-white">
        <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 animate-pulse" />
        </div>
        <h1 className="text-3xl font-extrabold mb-2">Order Tracking</h1>
        <p className="text-slate-500 mb-6">Order ID: <span className="font-mono text-xs">{orderId}</span></p>

        {/* Status Stepper */}
        <div className="flex justify-between items-center relative py-10">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 -translate-y-1/2 z-0 transition-all duration-1000"
            style={{ 
              width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
              background: `linear-gradient(to right, ${stepColors[0]}, ${stepColors[1]}, ${stepColors[2]}, ${stepColors[3]})`,
              backgroundSize: '300% 100%', // Larger background to keep gradient fixed
              backgroundPosition: 'left center'
            }}
          ></div>
          
          {steps.map((step, index) => (
            <div key={step} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                  index <= currentStepIndex 
                    ? 'text-white' 
                    : 'bg-white border-slate-100 text-slate-300'
                }`}
                style={index <= currentStepIndex ? {
                  backgroundColor: stepColors[index],
                  borderColor: `${stepColors[index]}44` // Faded border
                } : {}}
              >
                {index < currentStepIndex ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <span className={`mt-3 font-bold text-sm transition-colors duration-500`} style={{ color: index <= currentStepIndex ? stepColors[index] : '#94a3b8' }}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm mb-8">
        <h2 className="text-xl font-bold mb-6">Order Summary</h2>
        <div className="space-y-4 mb-8">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">{item.name} <span className="text-slate-400">x{item.quantity}</span></span>
              <span className="font-bold">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
          <span className="text-lg font-bold">Total Amount</span>
          <span className="text-2xl font-extrabold text-primary-600">₹{order.totalAmount}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button 
          onClick={handlePayment}
          disabled={order.paymentStatus === 'Paid' || paymentLoading}
          className={`flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-lg transition-all ${
            order.paymentStatus === 'Paid'
              ? 'bg-green-100 text-green-600 cursor-default'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {order.paymentStatus === 'Paid' ? (
            <><CheckCircle2 className="w-6 h-6" /> Paid</>
          ) : (
            <><CreditCard className="w-6 h-6" /> {paymentLoading ? 'Processing...' : 'Pay with QR'}</>
          )}
        </button>

        <button 
          onClick={downloadBill}
          className="flex items-center justify-center gap-3 bg-white border-2 border-slate-100 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all text-slate-700"
        >
          <Download className="w-6 h-6" /> Download Bill
        </button>
      </div>
    </div>
  );
};

export default OrderTracking;

# 🍽️ Restaurant Management System — Frontend

This is the frontend of a full-stack restaurant management system that enables customers to place orders, track them in real time, and make payments using Razorpay.

---

## 🚀 Features

* 🧾 Interactive Menu UI
* 📦 Real-time Order Tracking (via Socket.IO)
* 💳 Razorpay Payment Integration (Test Mode)
* 📄 Downloadable Bill (PDF)
* 👨‍🍳 Live Order Status Updates (Kitchen → Customer)
* 🔐 Admin Dashboard (Protected Routes)

---

## 🛠️ Tech Stack

* React (Vite)
* Tailwind CSS
* Axios
* Socket.IO Client
* Recharts
* Razorpay Checkout

---

## 📂 Project Structure

```
src/
 ├── pages/
 │   ├── MenuPage.jsx
 │   ├── OrderTracking.jsx
 │   ├── AdminDashboard.jsx
 │   ├── KitchenDashboard.jsx
 │
 ├── components/
 │   ├── Navbar.jsx
 │
 ├── App.jsx
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root:

```
VITE_API_URL=http://localhost:5001
VITE_RAZORPAY_KEY=your_test_key_here
```

---

## ▶️ Running Locally

```bash
npm install
npm run dev
```

---

## 🔗 Backend Repository

https://github.com/SahilKayasth-16/RestoPro_Backend

---

## ⚠️ Important Notes

* Ensure backend is running before starting frontend
* Razorpay works in **Test Mode only**
* Socket connection depends on correct `VITE_API_URL`

---

## 📸 Screens

* Menu Page
* Order Tracking
* Admin Dashboard

(Add screenshots here)

---

## 🧠 Future Improvements

* Payment failure handling UI
* Order retry logic
* Authentication improvements
* Deployment (Vercel)

---

## 👤 Author

Sahil Kayasth

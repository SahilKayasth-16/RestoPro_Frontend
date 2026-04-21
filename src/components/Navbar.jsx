import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UtensilsCrossed, LayoutDashboard, ChefHat } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = location.pathname === '/admin/login';
  const isAdminDashboard = location.pathname === '/admin/dashboard';

  const handleProtectedNav = (path, allowedRoles) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // Not logged in
    if (!token) {
      alert("It is for internal use only.");
      return;
    }

    // Wrong role
    if (!allowedRoles.includes(role)) {
      alert("You are not authorized to access admin panel.");
      return;
    }

    // ✅ Allowed
    navigate(path);
  };

  return (
    <nav className="glass-morphism sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary-600">
          <UtensilsCrossed className="w-8 h-8" />
          <span>Resto<span className="text-slate-900">Pro</span></span>
        </Link>

        {/* Navigation - Hidden on Login Page */}
        {!isLoginPage && (
          <div className="flex gap-6 items-center">

            {/* Kitchen */}
            <button
              onClick={() => {
                if (isAdminDashboard) {
                  navigate('/admin/login');
                } else {
                  handleProtectedNav('/kitchen', ['admin', 'kitchen']);
                }
              }}
              className="text-slate-600 hover:text-primary-600 flex items-center gap-1 transition-colors"
            >
              <ChefHat className="w-5 h-5" />
              <span className="hidden sm:inline">Kitchen</span>
            </button>

            {/* Admin */}
            <button
              onClick={() => {
                if (isAdminDashboard) {
                  // Stay on same page
                  return;
                }
                handleProtectedNav('/admin/dashboard', ['admin']);
              }}
              className="text-slate-600 hover:text-primary-600 flex items-center gap-1 transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="hidden sm:inline">Admin</span>
            </button>

          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
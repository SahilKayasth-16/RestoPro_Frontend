import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, LayoutDashboard, ChefHat } from 'lucide-react';

const Navbar = () => {
  const isAdmin = !!localStorage.getItem("adminToken");
  return (
    <nav className="glass-morphism sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary-600">
          <UtensilsCrossed className="w-8 h-8" />
          <span>Resto<span className="text-slate-900">Pro</span></span>
        </Link>
        <div className="flex gap-6 items-center">

          {isAdmin ? (
            <>
              <Link to="/kitchen" className="text-slate-600 hover:text-primary-600 flex items-center gap-1">
                <ChefHat className="w-5 h-5" />
                Kitchen
              </Link>

              <Link to="/admin/dashboard" className="text-slate-600 hover:text-primary-600 flex items-center gap-1">
                <LayoutDashboard className="w-5 h-5" />
                Admin
              </Link>
            </>
          ) : (
            <Link to="/admin/login" className="text-slate-600 hover:text-primary-600 flex items-center gap-1">
              <LayoutDashboard className="w-5 h-5" />
              Admin
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;

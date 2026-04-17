import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, LayoutDashboard, ChefHat } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="glass-morphism sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary-600">
          <UtensilsCrossed className="w-8 h-8" />
          <span>Resto<span className="text-slate-900">Pro</span></span>
        </Link>
        <div className="flex gap-6 items-center">
          <Link to="/kitchen" className="text-slate-600 hover:text-primary-600 flex items-center gap-1 transition-colors">
            <ChefHat className="w-5 h-5" />
            <span className="hidden sm:inline">Kitchen</span>
          </Link>
          <Link to="/admin/login" className="text-slate-600 hover:text-primary-600 flex items-center gap-1 transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

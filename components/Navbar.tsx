import React from 'react';
import { ShoppingCart, Menu, Zap, User } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  cartCount: number;
  user: UserProfile;
  onCartClick: () => void;
  onLogoClick: () => void;
  onProfileClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount, user, onCartClick, onLogoClick, onProfileClick }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center cursor-pointer" onClick={onLogoClick}>
            <div className="bg-indigo-600 p-2 rounded-lg mr-2">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">
              SmartShop <span className="text-indigo-600">AI</span>
            </span>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
             {/* Profile Trigger */}
             <button 
              onClick={onProfileClick}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border border-indigo-200">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-indigo-600" />
                )}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                {user.name.split(' ')[0]}
              </span>
            </button>

            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            <button 
              onClick={onCartClick}
              className="relative p-2 text-gray-500 hover:text-indigo-600 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="p-2 text-gray-500 hover:text-indigo-600 md:hidden">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
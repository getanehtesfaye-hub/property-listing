import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Home, User, LogOut, Heart, Shield, Building, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const getDashboardLink = () => {
    if (user?.role === 'ADMIN') return '/admin';
    if (user?.role === 'OWNER') return '/owner';
    return '/dashboard';
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-brand-600 font-extrabold text-xl tracking-tight">
              <Building className="w-6 h-6 stroke-[2.5]" />
              <span>AVELINE<span className="text-gray-900 font-medium">Property</span></span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-brand-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors">
              <Home className="w-4 h-4" />
              <span>Properties</span>
            </Link>

            {isAuthenticated ? (
              <>
                {user?.role === 'USER' && (
                  <Link to="/dashboard" className="text-gray-600 hover:text-brand-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    <span>My Favorites</span>
                  </Link>
                )}

                <Link
                  to={getDashboardLink()}
                  className="text-gray-600 hover:text-brand-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors"
                >
                  {user?.role === 'ADMIN' ? (
                    <Shield className="w-4 h-4 text-purple-600" />
                  ) : (
                    <User className="w-4 h-4 text-blue-600" />
                  )}
                  <span>
                    {user?.role === 'ADMIN' && 'Admin Console'}
                    {user?.role === 'OWNER' && 'Owner Dashboard'}
                    {user?.role === 'USER' && 'My Profile'}
                  </span>
                </Link>

                <div className="h-6 w-px bg-gray-200"></div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">
                    {user?.fullName.split(' ')[0]} ({user?.role})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-brand-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-brand-600 p-2 rounded-md"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="text-gray-700 hover:text-brand-600 block px-3 py-2.5 rounded-md text-base font-medium transition-colors"
          >
            Properties
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role === 'USER' && (
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-700 hover:text-brand-600 block px-3 py-2.5 rounded-md text-base font-medium transition-colors"
                >
                  My Favorites
                </Link>
              )}

              <Link
                to={getDashboardLink()}
                onClick={() => setIsOpen(false)}
                className="text-gray-700 hover:text-brand-600 block px-3 py-2.5 rounded-md text-base font-medium transition-colors"
              >
                {user?.role === 'ADMIN' && 'Admin Console'}
                {user?.role === 'OWNER' && 'Owner Dashboard'}
                {user?.role === 'USER' && 'My Profile'}
              </Link>

              <div className="border-t border-gray-100 my-2 pt-2">
                <div className="px-3 py-2 text-sm text-gray-500">
                  Signed in as: <span className="font-semibold text-gray-800">{user?.fullName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-red-600 hover:bg-red-50 block px-3 py-2.5 rounded-md text-base font-medium transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-gray-700 hover:bg-gray-100 block px-3 py-2.5 rounded-md text-base font-medium transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="w-full text-center bg-brand-600 hover:bg-brand-700 text-white block px-3 py-2.5 rounded-md text-base font-medium shadow-sm transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

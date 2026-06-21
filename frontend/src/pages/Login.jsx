import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { login as apiLogin } from '../api/auth';
import { Building, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: storeLogin } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle redirect if user tried to view protected resource
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiLogin(email, password);
      // Save token and user details in Zustand store
      storeLogin(response.data.user, response.data.token);

      // Redirect depending on user role or previous location
      const role = response.data.user.role;
      if (from !== '/') {
        navigate(from, { replace: true });
      } else if (role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'OWNER') {
        navigate('/owner');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please verify credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-6 px-4">
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center text-brand-600">
            <Building className="w-10 h-10 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">Welcome Back</h2>
          <p className="text-sm text-gray-500 font-medium">
            Log in to manage listings, favorites, and inquiries.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3.5 rounded-lg border border-red-100 flex items-start gap-2.5 text-sm font-semibold">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex justify-between">
              <span>Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-75 flex justify-center items-center"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500 font-medium pt-2 border-t border-gray-50">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-600 hover:underline font-bold">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

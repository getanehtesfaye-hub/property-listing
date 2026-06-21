import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useFavorites } from '../hooks/useFavorites';
import PropertyCard from '../components/PropertyCard';
import Spinner from '../components/Spinner';
import { User, Mail, ShieldAlert, Heart, Building } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuthStore();
  const { favorites, isLoading, error } = useFavorites();

  return (
    <div className="space-y-8">
      {/* Profile Overview Card */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">My Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-50 text-brand-600 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Full Name</p>
              <h4 className="font-bold text-gray-900 mt-0.5">{user?.fullName}</h4>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Email Address</p>
              <h4 className="font-bold text-gray-900 mt-0.5">{user?.email}</h4>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Account Role</p>
              <h4 className="font-bold text-gray-900 mt-0.5 capitalize">{user?.role}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Listings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          <h2 className="text-xl font-bold text-gray-900">Saved Properties ({favorites.length})</h2>
        </div>

        {isLoading ? (
          <Spinner size="lg" />
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-100 text-sm font-semibold">
            Error loading saved listings: {error.message || 'Please try again.'}
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white text-center py-16 px-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div className="text-gray-300 flex justify-center">
              <Building className="w-12 h-12 stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No saved properties</h3>
            <p className="text-gray-500 max-w-sm mx-auto text-sm">
              Properties you favorite on the home directory will show up here. You can unsave them instantly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;

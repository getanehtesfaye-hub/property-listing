import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Heart } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useFavorites } from '../hooks/useFavorites';

export const getImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';
  if (url.startsWith('/uploads')) {
    const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    return `${backendUrl}${url}`;
  }
  return url;
};

const PropertyCard = ({ property, showActions = false }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { isFavorited, toggleFavorite } = useFavorites();

  const isFav = isFavorited(property.id);

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    toggleFavorite(property);
  };

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.price);

  const mainImage = property.images && property.images.length > 0
    ? property.images[0].imageUrl
    : null;

  const statusBadge = () => {
    switch (property.status) {
      case 'DRAFT':
        return <span className="bg-gray-100 text-gray-800 border border-gray-200 text-xs px-2.5 py-1 rounded-full font-medium">Draft</span>;
      case 'PUBLISHED':
        return <span className="bg-green-100 text-green-800 border border-green-200 text-xs px-2.5 py-1 rounded-full font-medium">Published</span>;
      case 'ARCHIVED':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 text-xs px-2.5 py-1 rounded-full font-medium">Archived</span>;
      case 'DISABLED':
        return <span className="bg-red-100 text-red-800 border border-red-200 text-xs px-2.5 py-1 rounded-full font-medium">Disabled</span>;
      default:
        return null;
    }
  };

  return (
    <Link
      to={`/properties/${property.id}`}
      className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full"
    >
      {/* Property Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={getImageUrl(mainImage)}
          alt={property.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />

        {/* Favorite Button (Only for User/Owner/Guest - Admin does not need it) */}
        {user?.role !== 'ADMIN' && (
          <button
            onClick={handleFavoriteToggle}
            className="absolute top-3 right-3 p-2 rounded-full glass hover:bg-white text-gray-700 hover:text-red-500 transition-colors shadow-sm"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFav ? 'fill-red-500 text-red-500' : 'text-gray-700'
              }`}
            />
          </button>
        )}

        {/* Badges on Thumbnail */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-1.5">
          {statusBadge()}
        </div>
      </div>

      {/* Property details */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-1">
            {property.title}
          </h3>

          <div className="flex items-center gap-1 text-gray-500 text-xs mt-1.5">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="line-clamp-1">{property.location || 'Location not specified'}</span>
          </div>
        </div>

        <div className="flex items-baseline justify-between mt-4 pt-3 border-t border-gray-50">
          <div>
            <span className="text-lg font-extrabold text-brand-600">
              {formattedPrice}
            </span>
          </div>
          
          <div className="text-[10px] text-gray-400">
            {property.publishedAt ? new Date(property.publishedAt).toLocaleDateString() : 'Drafted'}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProperty } from '../api/properties';
import { disableProperty } from '../api/admin';
import ImageGallery from '../components/ImageGallery';
import Spinner from '../components/Spinner';
import { useAuthStore } from '../store/authStore';
import { useFavorites } from '../hooks/useFavorites';
import { MapPin, DollarSign, User, Mail, MessageSquare, Heart, ShieldAlert, ArrowLeft, CheckCircle } from 'lucide-react';
import { sendMessage } from '../api/messages';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const { isFavorited, toggleFavorite } = useFavorites();

  const [showContactModal, setShowContactModal] = useState(false);
  const [contactName, setContactName] = useState(user?.fullName || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactMessage, setContactMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [senderPhone, setSenderPhone] = useState('');

  // Fetch single property details
  const { data: property, isLoading, isError, error } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const response = await getProperty(id);
      return response.data;
    },
  });

  // Admin Disable Listing mutation
  const disableMutation = useMutation({
    mutationFn: async () => {
      await disableProperty(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', id] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      alert('Property listing has been disabled successfully.');
    },
  });

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    toggleFavorite(property);
  };

 const handleContactSubmit = async (e) => {
  e.preventDefault();
  setIsSending(true);

  try {
    await sendMessage({
      senderName: contactName,
      senderEmail: contactEmail,
      message: contactMessage,
        senderPhone,
      propertyId: property.id,
    });

    setSentSuccess(true);
    setContactMessage('');
  } catch (error) {
    alert('Failed to send message');
  } finally {
    setIsSending(false);
  }
};

  if (isLoading) return <Spinner size="lg" />;

  if (isError) {
    return (
      <div className="space-y-4 max-w-xl mx-auto text-center py-12">
        <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-100 font-medium">
          Property not found or you don't have permission to view it.
        </div>
        <Link to="/" className="inline-flex items-center gap-1 text-brand-600 font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </Link>
      </div>
    );
  }

  const isFav = isFavorited(property.id);
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.price);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back navigation */}
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-brand-600 font-semibold text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to properties
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side: Images & Description */}
        <div className="lg:col-span-2 space-y-6">
          <ImageGallery images={property.images} />

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
              Description
            </h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
              {property.description || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Right side: Key information & Actions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
            <div className="space-y-3">
              {property.status !== 'PUBLISHED' && (
                <span className="inline-block bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                  Status: {property.status}
                </span>
              )}
              <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
                {property.title}
              </h1>

              <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                <MapPin className="w-4 h-4 text-brand-500" />
                <span>{property.location}</span>
              </div>
            </div>

            <div className="border-t border-b border-gray-50 py-4 flex items-baseline justify-between">
              <span className="text-gray-500 text-sm font-medium">Price</span>
              <span className="text-3xl font-extrabold text-brand-600">{formattedPrice}</span>
            </div>

            {/* Actions Panel */}
            <div className="space-y-3">
              {user?.role !== 'ADMIN' && (
                <button
                  onClick={handleFavoriteClick}
                  className={`w-full py-3 rounded-lg border font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                    isFav
                      ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{isFav ? 'Saved in Favorites' : 'Add to Favorites'}</span>
                </button>
              )}

            {property.status === 'PUBLISHED' &&
 user?.id !== property.ownerId &&
 user?.role !== 'ADMIN' && (
  <button
    onClick={() => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      setShowContactModal(true);
    }}
    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-lg text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
  >
    <MessageSquare className="w-4 h-4" />
    <span>Contact Owner</span>
  </button>
)}

              {/* Admin Actions */}
              {user?.role === 'ADMIN' && property.status !== 'DISABLED' && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to disable this property listing?')) {
                      disableMutation.mutate();
                    }
                  }}
                  disabled={disableMutation.isLoading}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{disableMutation.isLoading ? 'Disabling...' : 'Disable Listing'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Owner details card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 border-b border-gray-50 pb-2">Listed By</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold text-lg">
                {property.owner?.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{property.owner?.fullName}</h4>
                <p className="text-gray-500 text-xs">Registered Property Owner</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Owner Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl p-6 max-w-md w-full space-y-4 animate-scale-in">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-600" />
                <span>Contact Owner</span>
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
              >
                Close
              </button>
            </div>

            {sentSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="text-green-500 flex justify-center">
                  <CheckCircle className="w-12 h-12 stroke-[1.5]" />
                </div>
                <h4 className="font-bold text-gray-800 text-lg">Message Sent!</h4>
                <p className="text-gray-500 text-sm">
                  Your inquiry has been forwarded to {property.owner?.fullName}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                   <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    phone number
                  </label>
                  <input
                  type="text"
               placeholder="Phone number"
             value={senderPhone}
             onChange={(e) => setSenderPhone(e.target.value)}
              />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Message
                  </label>
                  <textarea
                    required
                    rows="4"
                    placeholder={`Hi ${property.owner?.fullName}, I am interested in "${property.title}". Please get back to me.`}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-75"
                >
                  {isSending ? 'Sending Inquiry...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;

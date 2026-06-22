import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProperties } from '../api/properties';
import PropertyCard from '../components/PropertyCard';
import Spinner from '../components/Spinner';
import { Search, SlidersHorizontal, MapPin, DollarSign, X } from 'lucide-react';

const Home = () => {
  // Filter states
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const limit = 6;

  // Active query parameters (committed filters)
  const [searchParams, setSearchParams] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch properties
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['properties', { ...searchParams, sortBy, page }],
    queryFn: async () => {
      const response = await getProperties({
        page,
        limit,
        location: searchParams.location,
        minPrice: searchParams.minPrice,
        maxPrice: searchParams.maxPrice,
        sortBy,
        status: 'PUBLISHED', // regular users/guests only see PUBLISHED
      });
      return response.data;
    },
    keepPreviousData: true,
  });

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchParams({
      location,
      minPrice,
      maxPrice,
    });
    setShowMobileFilters(false);
  };

  const handleClearFilters = () => {
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
    setSearchParams({
      location: '',
      minPrice: '',
      maxPrice: '',
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-brand-950 py-16 px-6 sm:px-12 text-center text-white shadow-xl">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center"></div>
        <div className="relative max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Find Your Dream Property Today
          </h1>
          <p className="text-lg sm:text-xl text-brand-100 font-medium">
            Explore premium rental and purchase listings curated by trusted multi-tenant property owners.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar (Desktop) */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <form onSubmit={handleApplyFilters} className="hidden md:grid grid-cols-12 gap-4 items-center">
          {/* Location search */}
          <div className="col-span-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search location (e.g. Addis, California)..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          {/* Min Price */}
          <div className="col-span-2 relative">

            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          {/* Max Price */}
          <div className="col-span-2 relative">
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          {/* Sorting */}
          <div className="col-span-2">
            <select
              value={sortBy}
              onChange={(e) => {
                setPage(1);
                setSortBy(e.target.value);
              }}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-gray-700 bg-white"
            >
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="col-span-2 flex gap-2">
            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors shadow-sm"
            >
              Filter
            </button>
            {(searchParams.location || searchParams.minPrice || searchParams.maxPrice) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                title="Clear Filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Mobile controls bar */}
        <div className="flex md:hidden justify-between items-center gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="p-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
          <div className="bg-white w-80 h-full p-6 space-y-6 flex flex-col justify-between shadow-2xl animate-slide-in">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-900">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="text-gray-500 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Addis"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Min Price ()
                    </label>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Max Price ()
                    </label>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-200 text-sm bg-white"
                  >
                    <option value="newest">Newest first</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="oldest">Oldest first</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-1/2 border border-gray-200 py-3 rounded-lg text-sm text-gray-600 font-semibold hover:bg-gray-50"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="w-1/2 bg-brand-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-brand-700 shadow"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Listings */}
      {isLoading ? (
        <Spinner size="lg" />
      ) : isError ? (
        <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-100 text-center font-medium">
          Error loading properties: {error.message || 'Please try again later.'}
        </div>
      ) : !data || data.data?.data?.length === 0 ? (
        <div className="bg-white text-center py-16 px-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="text-gray-300 flex justify-center">
            <Search className="w-12 h-12 stroke-[1.5]" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">No properties found</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            We couldn't find any published properties matching your criteria. Try adjusting your search keywords or price filters.
          </p>
          {(searchParams.location || searchParams.minPrice || searchParams.maxPrice) && (
            <button
              onClick={handleClearFilters}
              className="text-brand-600 font-semibold text-sm hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.data.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {/* Pagination Controls */}
          {data.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-gray-600">
                Page <span className="font-semibold text-gray-900">{page}</span> of{' '}
                <span className="font-semibold text-gray-900">{data.totalPages}</span>
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;

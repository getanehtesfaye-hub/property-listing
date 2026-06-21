import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMetrics, disableProperty, enableProperty } from '../api/admin';
import { getProperties, deleteProperty } from '../api/properties';
import MetricCard from '../components/MetricCard';
import Spinner from '../components/Spinner';
import { getImageUrl } from '../components/PropertyCard';
import { Users, Building, ShieldAlert, Archive, Trash2, Eye, HelpCircle, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getOwnerMessages } from '../api/messages';

const AdminDashboard = () => {
  const queryClient = useQueryClient();

  // Fetch admin metrics
  const { data: metricsResponse, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['adminMetrics'],
    queryFn: getMetrics,
  });

  //
  const { data, isLoading } = useQuery({
  queryKey: ['owner-messages'],
  queryFn: async () => {
    const response = await getOwnerMessages();
    return response.data;
  },
});

  // Fetch all properties on the system (Admin gets everything)
  const { data: propertiesResponse, isLoading: isPropertiesLoading } = useQuery({
    queryKey: ['adminProperties'],
    queryFn: async () => {
      // By sending no filters (or status=null), we retrieve all active listings
      const response = await getProperties({ limit: 50 });
      return response.data;
    },
  });

  // Disable listing mutation
  const disableMutation = useMutation({
    mutationFn: async (id) => {
      await disableProperty(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['adminProperties'] });
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to disable listing');
    },
  });
   //enable listing mutation
   const enableMutation = useMutation({
  mutationFn: async (id) => {
    await enableProperty(id);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
    queryClient.invalidateQueries({ queryKey: ['adminProperties'] });
  },
 onError: (err) => {
  console.log("ENABLE ERROR:", err);
  console.log(err.response);
  alert(err.response?.data?.message || err.message || 'Failed to enable listing');
}
});
  // Delete listing mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await deleteProperty(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['adminProperties'] });
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to delete listing');
    },
  });

  if (isMetricsLoading || isPropertiesLoading) {
    return <Spinner size="lg" />;
  }

  const metrics = metricsResponse?.data || {
    totalUsers: 0,
    totalOwners: 0,
    totalProperties: 0,
    publishedProperties: 0,
    archivedProperties: 0,
    disabledProperties: 0,
  };

  const properties = propertiesResponse?.data || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-100 pb-5">
        <h1 className="text-2xl font-extrabold text-gray-900">Admin Control Panel</h1>
        <p className="text-gray-500 text-sm mt-1">
          Monitor system metrics, review tenant/owner statistics, and manage listings.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users (Tenants)"
          value={metrics.totalUsers}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Total Owners"
          value={metrics.totalOwners}
          icon={UserCheck}
          color="purple"
        />
        <MetricCard
          title="Active Listings"
          value={metrics.publishedProperties}
          icon={Building}
          color="green"
        />
        <MetricCard
          title="Disabled (Violations)"
          value={metrics.disabledProperties}
          icon={ShieldAlert}
          color="red"
        />
      </div>
     
      {/* Listings Table Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Global Listings Database</h2>
        
        {properties.length === 0 ? (
          <div className="bg-white text-center py-16 px-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-lg font-bold text-gray-800">No properties in system</h3>
            <p className="text-gray-500 max-w-sm mx-auto text-sm">
              There are currently no listings uploaded to the database.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 font-semibold text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-4">Listing</th>
                    <th className="px-6 py-4">Listed By</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {properties.map((property) => {
                    const mainImage = property.images && property.images.length > 0 ? property.images[0].imageUrl : null;
                    return (
                      <tr key={property.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <img
                            src={getImageUrl(mainImage)}
                            alt={property.title}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-100 bg-gray-50"
                          />
                          <div>
                            <h4 className="font-bold text-gray-900 line-clamp-1">{property.title}</h4>
                            <p className="text-gray-400 text-xs mt-0.5">ID: {property.id.slice(0, 8)}...</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-800">{property.owner?.fullName}</p>
                            <p className="text-gray-400 text-xs">{property.owner?.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{property.location || '—'}</td>
                        <td className="px-6 py-4 font-semibold text-brand-600">
                          ${new Intl.NumberFormat('en-US').format(property.price)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            property.status === 'PUBLISHED' ? 'bg-green-50 text-green-700 border border-green-200' :
                            property.status === 'DRAFT' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                            property.status === 'ARCHIVED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {property.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              to={`/properties/${property.id}`}
                              className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            {property.status !== 'DISABLED' ? (
                              <button
                                onClick={() => {
                                    disableMutation.mutate(property.id);
                                }}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Disable Listing"
                              >
                                <ShieldAlert className="w-4 h-4" />
                              </button>
                              ) : (
                <button
                  onClick={() => {
              enableMutation.mutate(property.id);  
                 }}
             className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
             title="Enable Listing"
                >
               <Archive className="w-4 h-4" />
              </button>
                  )}
    <button
                              onClick={() => {
                                  deleteMutation.mutate(property.id);
                              }}
                              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Delete Listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

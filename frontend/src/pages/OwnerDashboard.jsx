import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProperties, createProperty, updateProperty, publishProperty, archiveProperty, deleteProperty, uploadImages } from '../api/properties';
import { useAuthStore } from '../store/authStore';
import Spinner from '../components/Spinner';
import { getImageUrl } from '../components/PropertyCard';
import { PlusCircle, Edit2, CheckCircle2, Archive, Trash2, X, Upload, MapPin, DollarSign, Building } from 'lucide-react';
import { getOwnerMessages, deleteMessage } from '../api/messages';

const OwnerDashboard = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null); // null for create mode

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch owner properties
  const { data: properties = [], isLoading, isError, error } = useQuery({
    queryKey: ['ownerProperties'],
    queryFn: async () => {
      const response = await getProperties({ myListings: 'true' });
      return response.data.data;
    },
  });


 const { data, isLoading: messagesLoading } = useQuery({
  queryKey: ['owner-messages'],
  queryFn: async () => {
    const response = await getOwnerMessages();
    return response.data;
  },
});

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      return createProperty(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerProperties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      closeFormModal();
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || 'Failed to create listing');
    },
  });

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return updateProperty(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerProperties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      closeFormModal();
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || 'Failed to update listing');
    },
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: async (id) => {
      return publishProperty(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerProperties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      alert('Listing published successfully!');
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to publish listing');
    },
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: async (id) => {
      return archiveProperty(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerProperties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      alert('Listing archived successfully.');
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to archive listing');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return deleteProperty(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerProperties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      alert('Listing deleted successfully.');
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to delete listing');
    },
  });

  const openCreateModal = () => {
    setEditingProperty(null);
    setTitle('');
    setDescription('');
    setLocation('');
    setPrice('');
    setUploadedUrls([]);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (property) => {
    if (property.status !== 'DRAFT') {
      alert('Only properties in DRAFT status can be modified.');
      return;
    }
    setEditingProperty(property);
    setTitle(property.title);
    setDescription(property.description);
    setLocation(property.location);
    setPrice(property.price.toString());
    setUploadedUrls(property.images.map((img) => img.imageUrl));
    setFormError('');
    setIsModalOpen(true);
  };

  const closeFormModal = () => {
    setIsModalOpen(false);
    setEditingProperty(null);
  };

  // Handle image upload
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate size and format
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const invalidFile = files.find((file) => !allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024);

    if (invalidFile) {
      setFormError('Only JPG, JPEG, and PNG images under 5MB are allowed.');
      return;
    }

    setIsUploading(true);
    setFormError('');

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const response = await uploadImages(formData);
      const urls = response.data.urls;
      setUploadedUrls((prev) => [...prev, ...urls]);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setUploadedUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };
   const handleDeleteMessage = async (id) => {
  try {
    await deleteMessage(id);

    queryClient.invalidateQueries({
      queryKey: ['owner-messages']
    });
  } catch (error) {
    console.log(error.response?.data);
    alert("Delete failed");
  }
};

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Title is required');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setFormError('Price must be a valid positive number');
      return;
    }
  

    const payload = {
      title,
      description,
      location,
      price: priceNum,
      images: uploadedUrls,
    };

    if (editingProperty) {
      editMutation.mutate({ id: editingProperty.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'PUBLISHED': return 'bg-green-50 text-green-700 border border-green-200';
      case 'ARCHIVED': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'DISABLED': return 'bg-red-50 text-red-700 border border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Manage Properties</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create drafts, upload images, publish listings, and monitor their status.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-3 rounded-lg text-sm transition-all shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add Property</span>
        </button>
      </div>

      {/* Listings table or empty state */}
      {messagesLoading ? (
        <Spinner size="lg" />
      ) : isError ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-100 text-sm font-semibold">
          Error loading properties: {error.message || 'Please try again.'}
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white text-center py-16 px-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="text-gray-300 flex justify-center">
            <Building className="w-12 h-12 stroke-[1.5]" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">No properties yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto text-sm">
            You haven't created any property listings yet. Click the "Add Property" button to start creating drafts.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 font-semibold text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-4">Property</th>
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
                          <p className="text-gray-400 text-xs mt-0.5">Created: {new Date(property.createdAt).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{property.location || '—'}</td>
                      <td className="px-6 py-4 font-semibold text-brand-600">
                        ${new Intl.NumberFormat('en-US').format(property.price)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusStyle(property.status)}`}>
                          {property.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {property.status === 'DRAFT' && (
                            <>
                              <button
                                onClick={() => openEditModal(property)}
                                className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                title="Edit Draft"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to publish this listing? This will validate all details and release it to the directory.')) {
                                    publishMutation.mutate(property.id);
                                  }
                                }}
                                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Publish Property"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {property.status === 'PUBLISHED' && (
                            <button
                              onClick={() => {
                                  if (window.confirm('Are you sure you want to archive this property? This will hide it from the public directory.')) {
                                    archiveMutation.mutate(property.id);
                                  }
                              }}
                              className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Archive Property"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this property listing? This operation is a soft delete.')) {
                                deleteMutation.mutate(property.id);
                              }
                            }}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Soft Delete"
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
 <div className="bg-white p-6 rounded-lg shadow">
  <h2 className="text-xl font-bold mb-4">Customer Messages</h2>

  {isLoading ? (
    <p>Loading...</p>
  ) : data?.length === 0 ? (
    <p>No messages yet</p>
  ) : (
    data.map((msg) => (
      <div key={msg.id} className="border p-3 rounded mb-3">
        <p><strong>Property:</strong> {msg.property?.title}</p>
        <p><strong>Name:</strong> {msg.senderName}</p>
        <p><strong>Email:</strong> {msg.senderEmail}</p>
        <p><strong>Message:</strong> {msg.message}</p>
        <p><strong>Phone:</strong> {msg.senderPhone || 'Not provided'}</p>
       <button
  onClick={() => handleDeleteMessage(msg.id)}
  className="bg-red-500 text-white px-3 py-1 rounded mt-2"
>
  Delete
</button>
      </div>
    ))
  )}
   
</div>
      {/* Add / Edit Drawer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingProperty ? 'Edit Property Draft' : 'Add New Property'}
              </h3>
              <button onClick={closeFormModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-grow">
              {formError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 text-sm font-semibold flex items-center gap-2">
                  <X className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              <form id="property-form" onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Listing Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modern Minimalist Penthouse"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="e.g. welo sefer, addis ababa"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Price ()
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="e.g. 1500"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Provide details about rooms, amenities, and surroundings..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
                  ></textarea>
                </div>

                {/* File Uploader */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Property Images (JPEG, PNG | Max 5MB per file)
                  </label>
                  <div className="flex flex-col gap-3">
                    <label className="border-2 border-dashed border-gray-200 hover:border-brand-500 bg-gray-50 hover:bg-brand-50/10 cursor-pointer rounded-lg p-6 flex flex-col items-center gap-1.5 transition-colors">
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-600">Click to upload files</span>
                      <span className="text-xs text-gray-400">Select up to 5 images</span>
                      <input
                        type="file"
                        multiple
                        accept=".jpeg,.jpg,.png"
                        onChange={handleImageChange}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>

                    {isUploading && (
                      <div className="flex items-center gap-2 justify-center text-xs text-brand-600 font-semibold py-1 animate-pulse">
                        <Spinner size="sm" />
                        <span>Uploading images, please wait...</span>
                      </div>
                    )}

                    {/* Previews */}
                    {uploadedUrls.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 pt-2">
                        {uploadedUrls.map((url, index) => (
                          <div key={index} className="relative aspect-square border border-gray-100 rounded-lg overflow-hidden group">
                            <img src={getImageUrl(url)} alt={`Preview ${index}`} className="object-cover w-full h-full" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white p-1 rounded-full opacity-80 hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeFormModal}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 font-semibold hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="property-form"
                disabled={isUploading || createMutation.isLoading || editMutation.isLoading}
                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all shadow shadow-brand-100 disabled:opacity-75"
              >
                {editingProperty ? 'Save Changes' : 'Create Draft'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;

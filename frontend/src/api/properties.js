import client from './client';

export const getProperties = async (params) => {
  const response = await client.get('/properties', { params });
  return response.data;
};

export const getProperty = async (id) => {
  const response = await client.get(`/properties/${id}`);
  return response.data;
};

export const createProperty = async (propertyData) => {
  const response = await client.post('/properties', propertyData);
  return response.data;
};

export const updateProperty = async (id, propertyData) => {
  const response = await client.patch(`/properties/${id}`, propertyData);
  return response.data;
};

export const publishProperty = async (id) => {
  const response = await client.post(`/properties/${id}/publish`);
  return response.data;
};

export const archiveProperty = async (id) => {
  const response = await client.post(`/properties/${id}/archive`);
  return response.data;
};

export const deleteProperty = async (id) => {
  const response = await client.delete(`/properties/${id}`);
  return response.data;
};

export const uploadImages = async (formData) => {
  const response = await client.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

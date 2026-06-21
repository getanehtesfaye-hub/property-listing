import client from './client';

export const getMetrics = async () => {
  const response = await client.get('/admin/metrics');
  return response.data;
};

export const disableProperty = async (id) => {
  const response = await client.patch(`/admin/properties/${id}/disable`);
  return response.data;
};

export const enableProperty = async (id) => {
  const response = await client.patch(`/admin/properties/${id}/enable`);
  return response.data;
};
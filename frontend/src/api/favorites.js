import client from './client';

export const getFavorites = async () => {
  const response = await client.get('/favorites');
  return response.data;
};

export const addFavorite = async (propertyId) => {
  const response = await client.post('/favorites', { propertyId });
  return response.data;
};

export const removeFavorite = async (propertyId) => {
  const response = await client.delete(`/favorites/${propertyId}`);
  return response.data;
};

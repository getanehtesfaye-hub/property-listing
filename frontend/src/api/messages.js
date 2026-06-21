import client from './client';

export const sendMessage = (data) =>
  client.post('/messages', data);

export const getOwnerMessages = () =>
  client.get('/messages/owner');
export const deleteMessage = (id) =>
  client.delete(`/messages/${id}`);
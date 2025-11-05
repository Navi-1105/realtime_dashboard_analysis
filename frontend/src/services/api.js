import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const TOKEN = import.meta.env.VITE_JWT_TOKEN || 'demo-token';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }
});

export const sendEvent = async (eventData) => {
  const { data } = await api.post('/events', eventData);
  return data;
};

export const getRecentEvents = async (limit = 100) => {
  const { data } = await api.get(`/events/recent?limit=${limit}`);
  return data;
};



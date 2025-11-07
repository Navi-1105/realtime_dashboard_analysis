import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Get token from localStorage or fallback to demo-token
const getToken = () => {
  return localStorage.getItem('jwt_token') || import.meta.env.VITE_JWT_TOKEN || 'demo-token';
};

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const sendEvent = async (eventData) => {
  const { data } = await api.post('/events', eventData);
  return data;
};

export const getRecentEvents = async (limit = 100) => {
  const { data } = await api.get(`/events/recent?limit=${limit}`);
  return data;
};

export const login = async (username, password) => {
  const { data } = await axios.post(`${API_URL}/api/auth/login`, { username, password });
  return data;
};

export const verifyToken = async () => {
  try {
    const token = getToken();
    if (!token) return null;
    const { data } = await axios.get(`${API_URL}/api/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  } catch (error) {
    return null;
  }
};

export const getLatestAggregates = async () => {
  try {
    const { data } = await api.get('/aggregates/latest');
    return data.aggregates;
  } catch (error) {
    console.error('Failed to fetch aggregates:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Is backend running?');
    }
    return {};
  }
};



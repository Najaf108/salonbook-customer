// src/lib/api.js
import axios from 'axios';
import storage from './storage';

// Replace with your laptop's local IP when testing on phone
// Run "ipconfig" (Windows) or "ifconfig" (Mac) to find it
const BASE_URL = __DEV__
  ? 'https://salonbook-backend-xcno.onrender.com/api'
  : 'https://salonbook-backend-xcno.onrender.com/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await storage.get('token');
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url} - Token: ${token ? 'Found (Starts with ' + token.substring(0, 5) + '...)' : 'MISSING'}`);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — token expired
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('[API] 401 Unauthorized - Clearing session');
      const { forceLogout } = require('../stores/useAuthStore');
      forceLogout();
    }
    return Promise.reject(error);
  }
);

export default api;
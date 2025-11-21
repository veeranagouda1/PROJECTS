import axios from 'axios';
import { safeStorage, storageKeys } from '../utils/storage';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = safeStorage.getItem(storageKeys.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      safeStorage.removeItem(storageKeys.TOKEN);
      safeStorage.removeItem(storageKeys.ROLE);
      safeStorage.removeItem(storageKeys.USER_ID);
      safeStorage.removeItem(storageKeys.USER_EMAIL);
      window.location.href = '/login';
    }
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export default api;


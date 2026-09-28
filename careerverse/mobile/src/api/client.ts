import axios from 'axios';
import { storage } from '../utils/storage';
import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.241.247.177:5000/api';
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/api`;
  }

  return 'http://10.241.247.177:5000/api';
};

const DEFAULT_URL = getBaseUrl();

const apiClient = axios.create({
  baseURL: DEFAULT_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token and custom configured API URL dynamically
apiClient.interceptors.request.use(
  async (config) => {
    // Check if custom Wi-Fi API URL was configured by the user in Settings
    const customUrl = await storage.getApiUrl();
    if (customUrl) {
      config.baseURL = customUrl;
    }

    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle responses and provide friendly error messaging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const customMessage =
      error.response?.data?.message ||
      error.message ||
      'Network connection issue. Please check your internet or backend server.';
    return Promise.reject(new Error(customMessage));
  }
);

export default apiClient;

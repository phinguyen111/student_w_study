import axios from 'axios';

// Get API base URL
// - In the browser, prefer same-origin '/api' so Next.js can proxy via rewrites (avoids CORS + stale hard-coded domains).
// - Outside the browser, fall back to NEXT_PUBLIC_API_URL or localhost for dev.
export const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    return '/api';
  }

  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

console.log('API URL configured:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
  withCredentials: false, // Don't send cookies for CORS
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  // Log request in development
  if (process.env.NODE_ENV === 'development') {
    console.log('API Request:', config.method?.toUpperCase(), config.url, {
      baseURL: config.baseURL,
      headers: config.headers,
    });
  }
  
  return config;
}, (error) => {
  console.error('API Request Error:', error);
  return Promise.reject(error);
});

// Handle response errors
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    // Enhanced error logging
    console.error('API Error:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method,
      },
    });
    
    // Provide more specific error messages
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. The server took too long to respond.';
    } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      // Check if it's a CORS error
      if (error.message.includes('CORS') || error.response?.status === 0) {
        error.message = `CORS error: Cannot connect to backend at ${API_URL}. Please check CORS configuration.`;
      } else {
        error.message = `Cannot connect to server at ${API_URL}. Please check if the backend is running and accessible.`;
      }
    } else if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 401) {
        error.message = 'Unauthorized. Please login again.';
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      } else if (status === 403) {
        error.message = 'Forbidden. You do not have permission to access this resource.';
      } else if (status === 404) {
        error.message = 'Resource not found.';
      } else if (status === 500) {
        error.message = 'Server error. Please try again later.';
      } else {
        error.message = data?.message || `Server error (${status}).`;
      }
    } else if (!error.response) {
      error.message = `Network error. Cannot reach server at ${API_URL}. Please check your internet connection and backend configuration.`;
    }
    
    return Promise.reject(error);
  }
);

export default api;




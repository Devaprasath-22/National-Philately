import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getAssetUrl = (path) => {
  if (!path) return '';
  if (!path.startsWith('/uploads')) return path;
  return `${API_BASE_URL}${path}`;
};

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('philately_user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('philately_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;

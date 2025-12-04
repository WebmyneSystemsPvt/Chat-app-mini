import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !['/api/auth/login', '/api/auth/register'].includes(error.config.url)) {      
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('userData');
      localStorage.setItem('redirectReason', 'Token expired, please login again');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (formData) => api.post('/api/auth/register', formData),
};

export const userAPI = {
  getProfile: () => api.get('/api/users/profile'),
  getUser: (userId) => api.get(`/api/users/${userId}`),
  getAllUsers: () => api.get('/api/users'),
};

export const messageAPI = {
  getConversationMessages: (conversationId, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page: page,
      limit: limit,
    });
    return api.get(`/api/conversations/${conversationId}?${params}`)
  },
};


export const conversationAPI = {
  getAll: () => api.get('/api/conversations'),
};

export default api;
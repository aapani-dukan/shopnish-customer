import axios from 'axios';
import { auth } from '../lib/firebase';

const api = axios.create({
  baseURL: 'https://shopnish-seprate.onrender.com', 
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  
  if (user) {
    try {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (e) {
      console.warn("Token fetch failed, sending request without token");
    }
  }
  
  // Mobile app identification header (optional, good for backend logs)
  config.headers['X-Platform'] = 'mobile-android';
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
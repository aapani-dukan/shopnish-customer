import axios from 'axios';
import { auth } from '../lib/firebase';

const api = axios.create({
  // ✅ Pro-Tip: Ensure your Render URL is exactly this
  baseURL: 'https://shopnish-seprate.onrender.com', 
  timeout: 15000, // Timeout thoda badha diya (Render free tier kabhi-kabhi "Cold Start" leta hai)
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  
  if (user) {
    try {
      // ✅ Force refresh agar token expire hone wala ho
      const token = await user.getIdToken(false); 
      config.headers.Authorization = `Bearer ${token}`;
    } catch (e) {
      console.error("❌ [API Interceptor] Token fetch failed:", e);
    }
  }
  
  config.headers['X-Platform'] = 'mobile-android';
  config.headers['Content-Type'] = 'application/json';
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ✅ Optional: Response Interceptor (Error handling ke liye)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("🔒 Token expired or invalid, user might need to re-login");
    }
    return Promise.reject(error);
  }
);

export default api;
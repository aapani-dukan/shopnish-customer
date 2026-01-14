import axios from 'axios';
// ✅ BADLAV: getIdToken ko modular import karein
import { getAuth, getIdToken } from '@react-native-firebase/auth';

const auth = getAuth();

const api = axios.create({
  baseURL: 'https://shopnish-seprate.onrender.com', 
  timeout: 15000, 
});

api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    
    if (user) {
      // ✅ FIX: Modular way to get token (Zero Warnings)
      const token = await getIdToken(user); 
      
      config.headers.Authorization = `Bearer ${token}`;
      // Pro-Tip: Production mein is log ko hata dena
      console.log("✅ Token attached to request");
    } else {
      // Isko warn se debug kar dein taaki terminal pehle se zyada clean rahe
      console.debug("⚠️ No active session");
    }
  } catch (e) {
    console.error("❌ [API Interceptor] Token fetch failed:", e);
  }
  
  config.headers['X-Platform'] = 'mobile-android';
  config.headers['Content-Type'] = 'application/json';
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("🔒 Session expired, redirecting to login...");
    }
    return Promise.reject(error);
  }
);

export default api;
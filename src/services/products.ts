import api from './api';
import { Product } from '../types/Product';

// 🎯 फिक्स 1: होम स्क्रीन और लोकेशन (पिनकोड/लैट-लॉन्ग) के हिसाब से प्रोडक्ट्स लाने के लिए पैरम्स जोड़े भाई
export const fetchAllProducts = async (params?: { pincode?: string; lat?: number; lng?: number }): Promise<Product[]> => {
  // अगर बैकएंड पर रूट '/api/products' है तो इसे '/api/products' कर दें भाई
  const response = await api.get('/api/products', { params });
  return response.data?.products || response.data || [];
};

// 🎯 फिक्स 2: कैटेगरी डिटेल्स स्क्रीन पर 400 एरर को रोकने के लिए लोकेशन पैरामीटर्स यहाँ भी जोड़ दिए भाई
export const fetchProductsByCategory = async (
  categoryId: string | number, 
  locationParams?: { pincode?: string; lat?: number; lng?: number }
): Promise<Product[]> => {
  const params = {
    category: categoryId,
    pincode: locationParams?.pincode || '',
    lat: locationParams?.lat || 25.4419,
    lng: locationParams?.lng || 75.6597,
  };
  const response = await api.get('/api/products', { params });
  return response.data?.products || response.data || [];
};
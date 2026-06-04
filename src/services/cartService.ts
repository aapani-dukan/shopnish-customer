import api from './api';
import { CartResponse } from '../types/Carts';

export const cartService = {
  // 1. सर्वर से फ्रेश कार्ट डेटा खींचना भाई
  getCart: async (): Promise<CartResponse> => {
    try {
      const response = await api.get('/api/cart');
      // Web logic: अगर रिस्पॉन्स वैलिड न हो तो फॉलबैक भाई
      if (!response.data || !Array.isArray(response.data.items)) {
        return { items: [], totalAmount: 0 };
      }
      return response.data;
    } catch (error) {
      console.error("🛒 Cart Service Error:", error);
      return { items: [], totalAmount: 0 };
    }
  },

  // 🎯 फिक्स 1: क्वांटिटी अपडेट में अब 'variantId' और सही अपडेट राउट (/api/cart/update) का इस्तेमाल भाई!
  updateQuantity: async (productId: number, variantId: number | null, quantity: number) => {
    return await api.post('/api/cart/update', { 
      productId: Number(productId), 
      variantId: variantId ? Number(variantId) : null, // 👈 बैकएंड सर्विस को यह वेरिएंट आईडी चाहिए भाई
      quantity: Number(quantity) 
    });
  },

  // 🎯 फिक्स 2: कार्ट से किसी विशिष्ट वैरिएंट को पूरी तरह हटाने के लिए नया वॉटरप्रूफ फ़ंक्शन भाई!
  removeItem: async (productId: number, variantId: number | null) => {
    return await api.post('/api/cart/remove', { 
      productId: Number(productId), 
      variantId: variantId ? Number(variantId) : null 
    });
  }
};
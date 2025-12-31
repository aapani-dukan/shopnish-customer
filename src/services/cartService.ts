import api from './api';
import { CartResponse } from '../types/Cart';

export const cartService = {
  getCart: async (): Promise<CartResponse> => {
    try {
      const response = await api.get('/api/cart');
      // Web logic: fallback if response is not valid
      if (!response.data || !Array.isArray(response.data.items)) {
        return { items: [] };
      }
      return response.data;
    } catch (error) {
      console.error("🛒 Cart Service Error:", error);
      return { items: [] };
    }
  },

  updateQuantity: async (productId: number, quantity: number) => {
    return await api.post('/api/cart/add', { productId, quantity });
  }
};
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api'; // Aapka axios instance
import { useAuth } from '../context/AuthContext'; // User ID check karne ke liye

// 🎯 फिक्स 1: वैरिएंट सपोर्ट के लिए इंटरफ़ेस में 'variantId' और 'variant' ऑब्जेक्ट जोड़ दिया भाई!
export interface CartItem {
  id: number;
  productId: number;
  variantId: number; // 👈 अब यह सबसे जरूरी की (Key) है भाई
  quantity: number;
  product: {
    id: number;
    name: string;
    image?: string;
    sellerId: number;
  };
  variant?: {
    id: number;
    price: string | number;
    originalPrice?: string | number;
    quantityValue: string;
    unit: string;
  };
  name?: string; 
  price?: number;
}

interface CartContextType {
  cart: CartItem[];
  isLoading: boolean;
  // addToCart में अब प्रोडक्ट ऑब्जेक्ट या आईडी के साथ 'variantId' भी पास होगा भाई
  addToCart: (product: any, sellerId?: number, variantId?: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  refreshCart: () => Promise<void>;
}
const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // ✅ 1. Backend se Cart Fetch karna (Same as Web App)
  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart([]);
      return;
    }
    try {
      setIsLoading(true);
      const response = await api.get('/api/cart');
      // Web App structure: { items: [...] }
      setCart(response.data.items || []);
    } catch (error) {
      console.error("❌ Failed to fetch cart from server:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // App load hone par ya User badalne par cart refresh karein
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // 🎯 फिक्स 2: पेलोड के अंदर 'variantId' को वॉटरप्रूफ तरीके से इंजेक्ट करना भाई
  const addToCart = async (product: any, sellerId?: number, variantId?: number) => {
    const pId = typeof product === 'object' ? product.id : product;
    const finalSellerId = sellerId || product?.sellerId;
    
    // अगर डायरेक्ट ऑब्जेक्ट आया है और variantId बाहर से नहीं मिला, तो प्रोडक्ट के अंदर से पहला वैरिएंट ढूंढो भाई
    const finalVariantId = variantId || product?.variantId || product?.variants?.[0]?.id;
    
    if (!pId || !finalSellerId) {
      console.error("❌ Missing Data:", { pId, finalSellerId, finalVariantId });
      return;
    }

    try {
      const payload = {
        productId: Number(pId),
        variantId: finalVariantId ? Number(finalVariantId) : null, // 👈 बैकएंड सर्विस को यह वेरिएंट आईडी चाहिए भाई!
        quantity: 1,
        sellerId: Number(finalSellerId)
      };

      console.log("🚀 Syncing Variant-Aware Cart with Backend:", payload);

      const response = await api.post('/api/cart/add', payload);
      
      if (response.status === 200 || response.status === 201) {
        await refreshCart(); 
      }
      
    } catch (error: any) {
      console.error("❌ Add to cart failed:", error.response?.data || error.message);
    }
  };
  // ✅ 3. Remove Item
  const removeFromCart = async (cartItemId: number) => {
    try {
      await api.delete(`/api/cart/${cartItemId}`);
      await refreshCart();
    } catch (error) {
      console.error("❌ Remove from cart failed:", error);
    }
  };

  const clearCart = () => setCart([]);

  // ✅ 4. Calculations
 // ✅ फिक्स: प्रोडक्ट ऑब्जेक्ट से पुरानी प्राइस हटा दी, अब टाइपस्क्रिप्ट एकदम शांत है भाई!
  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      // अब यह सिर्फ वैरिएंट की प्राइस देखेगा, या फिर डायरेक्ट आइटम लेवल पर फॉलबैक चेक करेगा भाई
      const price = Number(item.variant?.price || item.price || 0);
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ 
      cart, isLoading, addToCart, removeFromCart, clearCart, getCartTotal, getCartCount, refreshCart 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
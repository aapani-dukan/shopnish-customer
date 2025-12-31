import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api'; // Aapka axios instance
import { useAuth } from '../context/AuthContext'; // User ID check karne ke liye

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: string | number;
    image?: string;
    sellerId: number;
  };
  // Mobile UI ke compatibility ke liye helper fields
  name?: string; 
  price?: number;
}

interface CartContextType {
  cart: CartItem[];
  isLoading: boolean;
  addToCart: (productId: number, sellerId: number) => Promise<void>;
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

  // ✅ 2. Add to Cart (Direct Server Sync)
  const addToCart = async (product: any, sellerId?: number) => {
  // 1. Product ID nikalne ka sabse safe tarika
  const pId = typeof product === 'object' ? product.id : product;
  const finalSellerId = sellerId || product?.sellerId;
  
  // 2. Extra Validation (Safety Check)
  if (!pId || !finalSellerId) {
    console.error("❌ Missing Data:", { pId, finalSellerId });
    return;
  }

  try {
    const payload = {
      productId: Number(pId),
      quantity: 1,
      sellerId: Number(sellerId)
    };

    console.log("🚀 Syncing with Backend:", payload);

    const response = await api.post('/api/cart/add', payload);
    
    if (response.status === 200 || response.status === 201) {
      await refreshCart(); // Server se nayi cart mangwayein
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
  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = Number(item.product?.price || 0);
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
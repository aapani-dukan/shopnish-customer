export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    sellerId: number; // Multi-seller logic ke liye zaroori
    sellerName?: string; 
  };
}

export interface CartResponse {
  items: CartItem[];
  totalAmount?: number;
}
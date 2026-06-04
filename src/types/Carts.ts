// 🎯 फिक्स 1: कार्ट आइटम के अंदर अब वैरिएंट की विशिष्ट जानकारी रेंडर करने के लिए इंटरफ़ेस अपग्रेड भाई
export interface CartItem {
  id: number;
  productId: number;
  variantId: number | null; // 👈 यह है नए आर्किटेक्चर की सबसे मुख्य चाबी भाई!
  quantity: number;
  product: {
    id: number;
    name: string;
    image: string;
    sellerId: number; 
    sellerName?: string; 
  };
  // 🎯 फिक्स 2: बैकएंड से आने वाले 'variant' ऑब्जेक्ट का पूरा ढांचा यहाँ लॉक कर दिया भाई
  variant?: {
    id: number;
    productId: number;
    price: number | string;
    originalPrice: number | string | null;
    quantityValue: string;
    unit: string;
  } | null;
}

export interface CartResponse {
  items: CartItem[];
  totalAmount?: number;
  subtotal?: number;       // सुरक्षा फॉलबैक के लिए एक्स्ट्रा कीज भाई
  deliveryCharge?: number;
}
export interface Seller {
  id: number;
  businessName: string;
}

// 🎯 फिक्स 1: नए वैरिएंट्स टेबल के ढांचे को टाइपस्क्रिप्ट में लॉक किया भाई
export interface ProductVariant {
  id: number;
  productId: number;
  price: number | string;       // वैरिएंट की अपनी कीमत (जैसे: ₹45)
  originalPrice: number | string | null; // पुराना दाम (कटौती दिखाने के लिए)
  quantityValue: string;        // मात्रा का नंबर (जैसे: 500, 1, 5)
  unit: string;                 // यूनिट का नाम (जैसे: gm, kg, Litre, piece)
  stock: number;                // इस विशिष्ट वैरिएंट का स्टॉक भाई
}

export interface Product {
  id: number;
  _id?: string;                 // सुरक्षा के लिए MongoDB/SQL स्ट्रिंग आईडी फॉलबैक भाई
  name: string;
  description: string | null;
  price: number;                // यह अब आपके बेस या मिनिमम स्टार्टिंग प्राइस की तरह काम करेगा भाई
  originalPrice: number | null;
  image: string;
  images: string[] | null;
  brand: string | null;
  stock: number;                // पूरी दुकान का कुल स्टॉक (सारे वैरिएंट्स का जोड़)
  rating: number | null;
  reviewCount: number | null;
  categoryName: string | null;
  categoryId?: number | string;  // एपीआई फ़िल्टरिंग के लिए उपयोगी चाबी भाई
  seller: Seller;
  
  // 🎯 फिक्स 2: प्रोडक्ट के अंदर अब वैरिएंट्स का एरे आना अनिवार्य है भाई!
  variants?: ProductVariant[];  
}

export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    firstName: string | null;
    lastName: string | null;
  };
}
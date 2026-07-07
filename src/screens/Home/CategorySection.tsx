import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Alert,ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronRight,Plus,Minus } from 'lucide-react-native'; // 🎯 आइकॉन इम्पोर्ट सुनिश्चित करें भाई
import { useCart } from '../../context/CartContext';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { useCartMutation } from '../../hooks/useCartMutatoin';
const { width } = Dimensions.get('window');

// 🎯 फिक्स 1: नए मल्टी-वैरिएंट नॉर्मलाइजेशन के साथ टाइप इंटरफ़ेस को अपडेट किया भाई
interface Product {
  id: string | number;
  _id?: string | number;
  name: string;
  name_hindi?: string;
  price: number; 
  mrp?: number;
  discountText?: string;
  image: string;
  seller?: { businessName: string ,id?: string | number};
  categoryId: string | number;
  variants?: Variant[];
  seller_id?: string | number; // 👈 यह भी जरूरी है जब आप कार्ट में जोड़ते हैं
  sellerId?: string | number; // 👈 यह भी जरूरी है जब आप कार्ट में जोड़ते हैं
  hasMultipleVariants?: boolean; // 👈 चेक करने के लिए कि 'From' लेबल दिखाना है या नहीं भाई
}
interface Variant {
  id: string | number;
  price: number;
  mrp?: number;
  discountText?: string;
}
interface Shop {
  id: string | number;
  businessName: string;
}
interface seller {
  id: string | number;
  businessName: string;
}
interface Category {
  id: string | number;
  name: string;
  icon?: string;
  image?: string;
  shops?: Shop[];
}

interface CategorySectionProps {
  category: Category;
  products: Product[];
  numColumns?: number;
}

const CategorySection: React.FC<CategorySectionProps> = ({ category, products, numColumns = 3 }) => {
  const navigation = useNavigation<any>();

  // 🎛️ आपके असली कॉन्टेक्स्ट से 'cart' (पुराना नाम) और एक्शन इंजन बाहर निकाले भाई!
  const { cart: cartItems, addToCart, removeFromCart, updateQuantity } = useCart();
  const handleSeeAll = async () => {
    try {
      const savedLocation = await AsyncStorage.getItem('userLocation');
      const location = savedLocation ? JSON.parse(savedLocation) : null;
      navigation.navigate('CategoryDetails', { 
        catId: category.id, 
        catName: category.name,
        pincode: location?.pincode,
        lat: location?.latitude,
        lng: location?.longitude
      });
    } catch (error) {
      navigation.navigate('CategoryDetails', { catId: category.id, catName: category.name });
    }
  };
const handleUpdateQuantity = async (item: any, delta: number) => {
  // 1. cart mein se item dhundho
  const cartItem = cartItems?.find((c: any) => String(c.productId || c.product_id) === String(item.id || item._id));
  
  if (cartItem) {
    // Agar cart mein hai, toh update ya remove
    const newQty = cartItem.quantity + delta;
    if (newQty > 0) {
      await updateQuantity(cartItem.id, newQty);
    } else {
      await removeFromCart(cartItem.id);
    }
  } else if (delta > 0) {
    // 🎯 FIX: Agar item cart mein nahi hai aur user ne Plus dabaya hai
    const variant = item.variants?.[0]; // Pehla variant lo
    if (variant) {
      await addToCart(item, Number(item.sellerId || item.seller?.id), Number(variant.id));
    }
  }
};
  // कैटेगरी फ़िल्टर और लिमिटेशन भाई
  const categoryProducts = useMemo(() => {
    return products
      .filter(p => String(p.categoryId) === String(category.id))
      .slice(0, 21);
  }, [products, category.id]);
  
  const cardWidth = (width - 32 - (numColumns - 1) * 10) / numColumns;

  return (
    <View style={styles.sectionContainer}>
      {/* Header Block */}
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 22 }}>{category.icon || '📦'}</Text>
          <Text style={styles.sectionTitle}>{category.name}</Text>
        </View>
        <TouchableOpacity onPress={handleSeeAll} style={styles.viewAllBadge}>
          <Text style={styles.seeAllBtn}>सब देखें</Text>
        </TouchableOpacity>
      </View>

      {/* Products Grid */}
      {categoryProducts.length > 0 ? (
        <View style={[styles.gridContainer, { gap: 10 }]}>
          {categoryProducts.map(item => {
            // 🎯 रीयल-टाइम चेक: क्या यह माल पहले से ग्राहक की असली 'cart' में तैर रहा है?
           // 🎯 SAFE AND ROBUST LOGIC
// 🎯 Backend se aa raha response 'items' key mein hai!
const quantityInCart = cartItems?.find((c: any) => 
  String(c.productId || c.product_id) === String(item.id || item._id)
)?.quantity || 0;


            return (
              <TouchableOpacity 
                key={item.id || item._id} 
                style={[styles.productCard, { width: cardWidth }]} 
                onPress={() => navigation.navigate('ProductDetails', { productId: item.id || item._id })}
                activeOpacity={0.9}
              >
                {/* Image Area */}
                <View style={[styles.imageContainer, { height: numColumns === 3 ? 110 : 150 }]}>
                  <Image source={{ uri: item.image }} style={styles.prodImage} />
                </View>
<View style={styles.infoArea}>
                  <Text style={styles.prodName} numberOfLines={2}>
                    {item.name_hindi ? item.name_hindi : item.name}
                  </Text>
                  <Text style={styles.sellerName} numberOfLines={1}>
                    {item.seller?.businessName || "Verified Shop"}
                  </Text>

                  {/* PRICE & BUTTON SECTION */}
                  <View style={{ flex: 1, position: 'relative', minHeight: 60, marginTop: 6 }}>
                    
                    {/* Price Section */}
                    <View style={{ width: '65%' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                       <Text style={{ fontSize: 13, fontWeight: '900', color: '#0f172a' }}>
  ₹{item.price}
  {item.hasMultipleVariants && (
    <Text style={{ color: '#da4444', fontSize: 10, fontWeight: '900' }}>
      +
    </Text>
  )}
</Text>
                      </View>
                      
                      {Number(item.mrp || 0) > Number(item.price || 0) && (
                        <Text style={{ fontSize: 10, color: '#94a3b8', textDecorationLine: 'line-through' }}>₹{item.mrp}</Text>
                      )}

                      {item.discountText ? (
                        <View style={{ backgroundColor: '#f0fdf4', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4, alignSelf: 'flex-start', marginTop: 2 }}>
                          <Text style={{ fontSize: 9, fontWeight: '700', color: '#16a34a' }}>{item.discountText}</Text>
                        </View>
                      ) : null}
                    </View>
                    {/* Right: Absolute Position Button */}
<View style={{ position: 'absolute', right: 0, bottom: 0, zIndex: 10 }}>
  {quantityInCart === 0 ? (
    <TouchableOpacity 
      style={{ backgroundColor: 'rgba(236, 236, 236, 0.28)', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ddd6fe' }}
      onPress={() => handleUpdateQuantity(item, 1)}
    >
      <Plus size={10} color="#3a26f1" strokeWidth={3} />
    </TouchableOpacity>
  ) : (
    <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        // 🎯 Transparent background (90% visible, 10% transparent)
        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
        borderRadius: 8, 
        overflow: 'hidden',
        height: 25 
    }}>
      
      {/* MINUS Button - Pukka kar lo import sahi hai */}
      <TouchableOpacity style={{ padding: 8 }} onPress={() => handleUpdateQuantity(item, -1)}>
        <Minus size={18} color="#e92f2f" strokeWidth={3} />
      </TouchableOpacity>
      
      <Text style={{ paddingHorizontal: 8, fontSize: 14, fontWeight: '900', color: '#4f38b6' }}>
        {quantityInCart}
      </Text>
      
      {/* PLUS Button */}
      <TouchableOpacity style={{ padding: 8 }} onPress={() => handleUpdateQuantity(item, 1)}>
        <Plus size={18} color="#e92f2f" strokeWidth={3} />
      </TouchableOpacity>
    </View>
  )}
</View>
         </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <Text style={styles.comingSoonText}>जल्द आ रहा है...</Text>
      )}
      
      {category.shops && category.shops.length > 0 && (
        <View style={styles.shopsContainer}>
          {category.shops.slice(0, 2).map((shop: any) => (
            <TouchableOpacity key={shop.id} style={styles.shopCard} onPress={() => navigation.navigate('ShopDetails', { sellerId: shop.id, shopName: shop.businessName })}>
              <Text style={styles.shopName} numberOfLines={1}>{shop.businessName}</Text>
              <ChevronRight size={12} color="#2563eb" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default CategorySection;

const styles = StyleSheet.create({
  sectionContainer: { marginTop: 15, marginBottom: 10 },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    marginBottom: 12 
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 },
  seeAllBtn: { color: '#2563eb', fontWeight: '800', fontSize: 12, backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  viewAllBadge: { padding: 2 },
  
  gridContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: 16,
  },
  productCard: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
    
  },
  imageContainer: { width: '100%', backgroundColor: '#f8fafc' },
  prodImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  infoArea: { 
    padding: 8, 
    flex: 1, // 👈 ये कंटेंट को दबाकर रखेगा
    justifyContent: 'space-between' 
  },
  prodName: { fontSize: 12, fontWeight: '700', color: '#1e293b', lineHeight: 16, height: 32, marginBottom: 4 },
  sellerName: { fontSize: 10, color: '#94a3b8', marginTop: 1, fontWeight: '500' },
  
  comingSoonText: { paddingHorizontal: 16, color: '#94a3b8', fontStyle: 'italic', fontSize: 13 },
  
  shopsContainer: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 4 },
  shopCard: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#f8fafc', 
    padding: 12, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#edf2f7'
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // 🎯 PRICE ko ek line mein rakhne ke liye center alignment
   marginTop: 'auto',
    flexWrap: 'nowrap', // 👈 PRICE ko do line mein aane se rokne ke liye
  },
  shopName: { fontSize: 12, fontWeight: '700', color: '#4a5568', flex: 1, marginRight: 5 }
});
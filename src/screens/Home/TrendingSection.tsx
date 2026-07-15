 import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions,Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Sparkles,Plus,Minus } from 'lucide-react-native';
import { useCart } from '../../context/CartContext';
const { width } = Dimensions.get('window');

// 🎯 फिक्स 1: नए मल्टी-वैरिएंट आर्किटेक्चर के साथ टाइप इंटरफ़ेस को अपडेट किया भाई
interface Product {
  id: string | number;
  _id?: string | number;
  name: string;
  nameHindi?: string;
  price: number; 
  mrp?: number;
  discountText?: string;
  image: string;
  seller_id?: string | number; // 👈 यह भी जरूरी है जब आप कार्ट में जोड़ते हैं
  variants?: Variant[]; // 👈 यह वैरिएंट्स की लिस्ट है, जो "ADD" बटन के लिए जरूरी है भाई
  seller?: { businessName: string };
  hasMultipleVariants?: boolean; // 👈 चेक करने के लिए कि 'From ₹' दिखाना है या नहीं भाई
  baseVariantId?: number; // 👈 यह बेस वैरिएंट की ID है, जो "ADD" बटन के लिए जरूरी है भाई
}
interface Variant {
  id: string | number;
  price: number;
  mrp?: number;
  discountText?: string;
}
interface TrendingSectionProps {
  title?: string;
  products: Product[];
  numColumns?: number; // 2 or 3
  currentLocation?: {
    pincode?: string;
    latitude?: number;
    longitude?: number;
  } | null
}

const TrendingSection: React.FC<TrendingSectionProps> = ({
  title,
  products,
  numColumns = 3,
  currentLocation,
}) => {
  const navigation = useNavigation<any>();
  
  // 🎛️ जादुई कार्ट हुक का लाइव इस्तेमाल भाई साहब!
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();

  if (!products || products.length === 0) return null;

  // Dynamic Card Width Calculation
  const dynamicCardWidth = (width - 32 - (numColumns - 1) * 10) / numColumns;
const handleUpdateQuantity = async (item: any, delta: number) => {
  // item ko cart mein dhundho
  const cartItem = cart?.find((c: any) => String(c.productId || c.product_id) === String(item.id || item._id));
  
  if (cartItem) {
    // Agar cart mein hai, toh newQty calculate karke update karo
    const newQty = cartItem.quantity + delta;
    if (newQty > 0) {
      await updateQuantity(cartItem.id, newQty);
    } else {
      await removeFromCart(cartItem.id);
    }
  } else if (delta > 0) {
    // Agar cart mein nahi hai, toh pehli baar add karo
    const variant = item.variants?.[0];
    if (variant) {
      await addToCart(item, Number(item.sellerId || item.seller?.id), Number(variant.id));
    } else {
      Alert.alert("Error", "Variant missing!");
    }
  }
};
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Sparkles size={18} color="#f59e0b" fill="#f59e0b" />
          <Text style={styles.title}>
  {title || "Trending Products"}
</Text>
        </View>
       <TouchableOpacity
  onPress={() =>
    navigation.navigate("Search", {
      showAll: true,
      pincode: currentLocation?.pincode,
      lat: currentLocation?.latitude,
      lng: currentLocation?.longitude,
    })
  }
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
>
  <Text style={styles.seeAllBtn}>View All</Text>
</TouchableOpacity>
      </View>

      {/* Grid Layout */}
      <View style={[styles.grid, { gap: 10 }]}>
        {products.slice(0, 9).map((item) => {
          // 🎯 रीयल-टाइम चेक: क्या यह माल पहले से ग्राहक की टोकरी में तैर रहा है?
          const existingCartItem = cart.find((c: any) => String(c.productId) === String(item.id || item._id));
          const quantityInCart = existingCartItem ? existingCartItem.quantity : 0;

          return (
            <TouchableOpacity
              key={item.id || item._id}
              style={[styles.card, { width: dynamicCardWidth }]}
              onPress={() => navigation.navigate('ProductDetails', { productId: item.id || item._id })}
              activeOpacity={0.9}
            >
              {/* Image Container */}
              <View style={[styles.imageWrapper, { height: numColumns === 3 ? 110 : 150 }]}>
                <Image source={{ uri: item.image }} style={styles.image} />
                {numColumns === 2 && (
                  <View style={styles.trendingBadge}>
                    <Text style={styles.badgeText}>🔥 Trending</Text>
                  </View>
                )}
              </View>

              {/* Content Area */}
              <View style={styles.info}>
                 {/* इंग्लिश नाम के लिए */}
  <Text style={styles.englishName}>
    {item.name}
  </Text>
                {item.nameHindi && (
    <Text style={styles.hindiName} numberOfLines={1}>
      {item.nameHindi}
    </Text>
  )}
                <Text style={styles.seller} numberOfLines={1}>
                  {item.seller?.businessName || 'Verified Shop'}
                </Text>
                
                {/* 🎯 फिक्स: प्राइज रो और मखमली क्विक कार्ट प्लस काउंटर का महा-संगम भाई साहब */}
               <View
   style={{
      flexDirection:'row',
      justifyContent:'space-between',
      alignItems:'flex-end',
      marginTop:6
   }}
>
                  <View style={{ flex: 1, paddingRight: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                     
                      {/* असली सेलिंग प्राइस */}
                     <Text style={{ fontSize: 13, fontWeight: '900', color: '#0f172a' }}>
  ₹{item.price}
  {item.hasMultipleVariants && (
    <Text style={{ color: '#fc4b34', fontSize: 10, fontWeight: '900' }}>
      +
    </Text>
  )}
</Text>
                    </View>

                    {/* लाइन से कटी हुई MRP */}
                    {Number(item.mrp || 0) > Number(item.price || 0) && (
                      <Text style={{ fontSize: 10, color: '#94a3b8', textDecorationLine: 'line-through', marginTop: 1 }}>
                        ₹{item.mrp}
                      </Text>
                    )}

                    {/* डायनामिक बिज़नेस डिस्काउंट बैज */}
                    {item.discountText ? (
                      <View style={{ backgroundColor: '#f0fdf4', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4, alignSelf: 'flex-start', marginTop: 2 }}>
                        <Text style={{ fontSize: 9, fontWeight: '700', color: '#16a34a' }}>{item.discountText}</Text>
                      </View>
                    ) : null}
                  </View>

             {/* 🛒 जादुई काउंटर बक्सा (इसे Absolute से बाहर निकालें) */}
 <View
   style={{
      width:40,
      alignItems:'flex-end',
      justifyContent:'flex-end'
   }}
>
    {quantityInCart === 0 ? (
      <TouchableOpacity 
        style={{ backgroundColor: 'rgba(236, 236, 236, 0.28)', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ddd6fe' }}
        onPress={() => handleUpdateQuantity(item, 1)}
      >
        <Plus size={16} color="#3a26f1" strokeWidth={3} />
      </TouchableOpacity>
    ) : (
      <View style={{ 
          flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.9)', 
          borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb', height: 35 
      }}>
        <TouchableOpacity style={{ padding: 8 }} onPress={() => handleUpdateQuantity(item, -1)}>
          <Minus size={18} color="#e92f2f" strokeWidth={3} />
        </TouchableOpacity>
        <Text style={{ paddingHorizontal: 8, fontSize: 14, fontWeight: '900', color: '#4f38b6' }}>
          {quantityInCart}
        </Text>
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
    </View>
  );
}
export default TrendingSection;

const styles = StyleSheet.create({
  container: { marginTop: 10, marginBottom: 20 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    marginBottom: 12 
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 18, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 },
  seeAllBtn: { color: '#2563eb', fontWeight: '800', fontSize: 12, backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: 16,
  },
  // StyleSheet में ये बदलाव करें
info: { 
  padding: 8,  
},
card: {
  backgroundColor: '#fff',
  borderRadius: 18,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: '#f1f5f9',
  overflow: 'hidden',
},
  imageWrapper: { 
    width: '100%', 
    backgroundColor: '#f8fafc' 
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  trendingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { fontSize: 8, fontWeight: '900', color: '#0f172a' },
   hindiName: {
    fontSize: 11,
    
    color: '#fd0101', // हिंदी नाम गहरा काला (या अपना मनपसंद कलर)
    marginBottom: 2,
  },
  englishName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#010408', // इंग्लिश नाम हल्का ग्रे (ताकि हिंदी मुख्य दिखे)
  },
 
  seller: { fontSize: 10, color: '#94a3b8', marginTop: 1, fontWeight: '500' },
});
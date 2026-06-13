import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronRight } from 'lucide-react-native'; // 🎯 आइकॉन इम्पोर्ट सुनिश्चित करें भाई

const { width } = Dimensions.get('window');

// 🎯 फिक्स 1: नए मल्टी-वैरिएंट नॉर्मलाइजेशन के साथ टाइप इंटरफ़ेस को अपडेट किया भाई
interface Product {
  id: string | number;
  _id?: string | number;
  name: string;
  price: number; 
  mrp?: number;
  discountText?: string;
  image: string;
  seller?: { businessName: string };
  categoryId: string | number;
  hasMultipleVariants?: boolean; // 👈 चेक करने के लिए कि 'From' लेबल दिखाना है या नहीं भाई
}

interface Shop {
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

  // कैटेगरी फ़िल्टर और लिमिटेशन भाई
  const categoryProducts = useMemo(() => {
    return products
      .filter(p => String(p.categoryId) === String(category.id))
      .slice(0, 6);
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
          {categoryProducts.map(item => (
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

              {/* Info Area - Trending Style */}
              <View style={styles.infoArea}>
                <Text style={styles.prodName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.sellerName} numberOfLines={1}>
                  {item.seller?.businessName || "Verified Shop"}
                </Text>

                {/* 🎯 फिक्स 2: कटी हुई MRP और डायनामिक बिज़नेस डिस्काउंट बैज का महा-संगम भाई साहब */}
                <View style={{ marginTop: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                    {item.hasMultipleVariants && (
                      <Text style={{ fontSize: 11, color: '#64748b', fontWeight: '600' }}>From </Text>
                    )}
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a' }}>₹{item.price}</Text>
                    
                    {Number(item.mrp || 0) > Number(item.price || 0) && (
                      <Text style={{ fontSize: 11, color: '#94a3b8', textDecorationLine: 'line-through' }}>
                        ₹{item.mrp}
                      </Text>
                    )}
                  </View>

                  {/* डायनामिक बिज़नेस डिस्काउंट बैज (% OFF या Flat OFF) */}
                  {item.discountText ? (
                    <View style={{ backgroundColor: '#f0fdf4', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, alignSelf: 'flex-start', marginTop: 3 }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: '#16a34a' }}>{item.discountText}</Text>
                    </View>
                  ) : null}
                </View>

              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.comingSoonText}>जल्द आ रहा है...</Text>
      )}
      {category.shops && category.shops.length > 0 && (
        <View style={styles.shopsContainer}>
          {category.shops.slice(0, 2).map((shop: any) => (
            <TouchableOpacity 
              key={shop.id} 
              style={styles.shopCard} 
              onPress={() => navigation.navigate('ShopDetails', { sellerId: shop.id, shopName: shop.businessName })}
            >
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
    borderRadius: 18, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  imageContainer: { width: '100%', backgroundColor: '#f8fafc' },
  prodImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  infoArea: { padding: 8 },
  prodName: { fontSize: 12, fontWeight: '700', color: '#1e293b', lineHeight: 16, height: 32, marginBottom: 2 },
  sellerName: { fontSize: 10, color: '#94a3b8', marginTop: 1, fontWeight: '500' },
  priceRow: { flexDirection: 'row', marginTop: 4, gap: 1 },
  fromText: { fontSize: 10, color: '#64748b', fontWeight: '600' },
  currency: { fontSize: 10, fontWeight: '900', color: '#2563eb' },
  priceValue: { fontSize: 15, fontWeight: '900', color: '#2563eb' },
  
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
  shopName: { fontSize: 12, fontWeight: '700', color: '#4a5568', flex: 1, marginRight: 5 }
});
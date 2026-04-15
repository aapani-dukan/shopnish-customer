// screens/Home/CategorySection.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// width को एक नया नाम (alias) दे दें ताकि टकराव न हो


interface Product {
  id: string | number;
  _id?: string | number;
  name: string;
  price: number;
  image: string;
  seller?: { businessName: string };
  categoryId: string | number;
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

const { width } = Dimensions.get('window');

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

  const categoryProducts = products
    .filter(p => String(p.categoryId) === String(category.id))
    .slice(0, 6);
  
  const cardWidth = (width - 32 - (numColumns - 1) * 10) / numColumns;

  return (
    <View style={styles.sectionContainer}>
      {/* Header */}
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
              {/* Image Area - No more price tag on top */}
              <View style={[styles.imageContainer, { height: numColumns === 3 ? 110 : 150 }]}>
                <Image source={{ uri: item.image }} style={styles.prodImage} />
              </View>

              {/* Info Area - Trending Style */}
              <View style={styles.infoArea}>
                {/* ✅ 1. Name: Changed to 2 lines with fixed height */}
                <Text style={styles.prodName} numberOfLines={2}>{item.name}</Text>
                
                {/* ✅ 2. Seller Name: Consistent with Trending */}
                <Text style={styles.sellerName} numberOfLines={1}>
                  {item.seller?.businessName || "Verified Shop"}
                </Text>

                {/* ✅ 3. Price: Bottom Blue Style like Trending */}
                <View style={styles.priceRow}>
                  <Text style={styles.currency}>₹</Text>
                  <Text style={styles.priceValue}>{item.price}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.comingSoonText}>जल्द आ रहा है...</Text>
      )}

      {/* Shops Row - logic same */}
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

const styles = StyleSheet.create({
  sectionContainer: { marginTop: 10, borderBottomWidth: 8, borderBottomColor: '#f8fafc', paddingBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  viewAllBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  seeAllBtn: { color: '#2563eb', fontWeight: '800', fontSize: 12 },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginTop: 10 },
  productCard: { 
    backgroundColor: '#fff', 
    borderRadius: 18, 
    marginBottom: 10, 
    elevation: 2, 
    borderWidth: 1, 
    borderColor: '#f1f5f9', 
    overflow: 'hidden' 
  },
  imageContainer: { width: '100%', backgroundColor: '#f8fafc' },
  prodImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  
  infoArea: { padding: 8 },
  // ✅ Name: 2 Line Logic with Height
  prodName: { fontSize: 12, fontWeight: '700', color: '#1e293b', height: 32, lineHeight: 16 },
  sellerName: { fontSize: 10, color: '#94a3b8', marginTop: 2, fontWeight: '500' },
  
  // ✅ Price Row: Blue Style (Trending jaisa)
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4, gap: 1 },
  currency: { fontSize: 10, fontWeight: '900', color: '#2563eb' },
  priceValue: { fontSize: 15, fontWeight: '900', color: '#2563eb' },

  comingSoonText: { color: '#9ca3af', marginLeft: 20, fontStyle: 'italic', fontSize: 12 },
  
  shopsContainer: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 10, gap: 8 },
  shopCard: { flex: 1, backgroundColor: '#fff', padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shopName: { fontSize: 10, fontWeight: '800', color: '#1e293b', flex: 1 },
});

export default CategorySection;
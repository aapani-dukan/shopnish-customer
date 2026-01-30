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

      // 'सब देखें' पर क्लिक करने पर लोकेशन भी भेजें
      navigation.navigate('CategoryDetails', { 
        catId: category.id, 
        catName: category.name,
        // 👇 ये बैकएंड के लिए बहुत ज़रूरी हैं
        pincode: location?.pincode,
        lat: location?.latitude,
        lng: location?.longitude
      });
    } catch (error) {
      navigation.navigate('CategoryDetails', { catId: category.id, catName: category.name });
    }
  };
  // ✅ फ़िल्टर लॉजिक
  const categoryProducts = products
    .filter(p => String(p.categoryId) === String(category.id))
    .slice(0, 6);
  
  const categoryShops = category.shops?.slice(0, 2) || [];

  // ✅ डायनामिक चौड़ाई (32 = Horizontal Padding, (n-1)*10 = Gaps)
  const cardWidth = (width - 32 - (numColumns - 1) * 10) / numColumns;

  return (
    <View style={styles.sectionContainer}>
      {/* Header */}
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 22 }}>{category.icon || '📦'}</Text>
          <Text style={styles.sectionTitle}>{category.name}</Text>
        </View>
      <TouchableOpacity onPress={handleSeeAll}>
          <Text style={styles.seeAllBtn}>सब देखें</Text>
        </TouchableOpacity>
      </View>

      {/* Products Grid (Dynamic 2-2 or 3-3) */}
      {categoryProducts.length > 0 ? (
        <View style={[styles.gridContainer, { gap: 10 }]}>
          {categoryProducts.map(item => (
            <TouchableOpacity 
              key={item.id || item._id} 
              style={[styles.productCard, { width: cardWidth }]} 
              onPress={() => navigation.navigate('ProductDetails', { productId: item.id || item._id })}
              activeOpacity={0.8}
            >
              <View style={[styles.imageContainer, { height: numColumns === 3 ? 100 : 150 }]}>
                <Image source={{ uri: item.image }} style={styles.prodImage} />
                <View style={styles.priceTag}>
                  <Text style={styles.priceText}>₹{item.price}</Text>
                </View>
              </View>
              <View style={styles.infoArea}>
                <Text style={styles.prodName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.sellerName} numberOfLines={1}>
                  {item.seller?.businessName || "Verified Shop"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.comingSoonText}>जल्द आ रहा है...</Text>
      )}

      {/* Shops Row (Premium Shop Links) */}
      {categoryShops.length > 0 && (
        <View style={styles.shopsContainer}>
          {categoryShops.map((shop: any) => (
            <TouchableOpacity 
              key={shop.id} 
              style={styles.shopCard} 
              onPress={() => navigation.navigate('ShopDetails', { sellerId: shop.id,shopName: shop.businessName })}
            >
              <Text style={styles.shopName} numberOfLines={1}>{shop.businessName}</Text>
              <ChevronRight size={14} color="#2563eb" />
            </TouchableOpacity>
          ))}
          {category.shops && category.shops.length > 2 && (
            <TouchableOpacity 
              style={styles.seeAllShopsBtn}
              onPress={() => navigation.navigate('CategoryShops', { catId: category.id, catName: category.name })}
            >
              <Text style={styles.seeAllShopsText}>
                {`All ${category.shops.length} Shops →`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  // सेक्शन का मुख्य कंटेनर (Divider के साथ)
  sectionContainer: { 
    marginTop: 10, 
    borderBottomWidth: 8, 
    borderBottomColor: '#f8fafc', 
    paddingBottom: 20 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 10 
  },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  seeAllBtn: { color: '#2563eb', fontWeight: 'bold' },

  // ग्रिड लेआउट (डायनामिक विड्थ के लिए तैयार)
  gridContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: 16, 
    marginTop: 10,
    justifyContent: 'flex-start' // 👈 3-ग्रिड में इसे 'flex-start' ही रखें
  },
  productCard: { 
    // width अब इनलाइन स्टाइल से आएगी (जो हमने cardWidth बनाया था)
    backgroundColor: '#fff', 
    borderRadius: 24, 
    marginBottom: 20, 
    elevation: 3, 
    borderWidth: 1, 
    borderColor: '#f1f5f9', 
    paddingBottom: 10,
    overflow: 'hidden'
  },
  imageContainer: { 
    width: '100%', 
    // height भी इनलाइन स्टाइल से आएगी (numColumns के हिसाब से)
    overflow: 'hidden', 
    position: 'relative' 
  },
  prodImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  priceTag: { 
    position: 'absolute', 
    bottom: 8, 
    left: 8, 
    backgroundColor: 'rgba(255,255,255,0.95)', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 10 
  },
  priceText: { fontSize: 13, fontWeight: '900', color: '#0f172a' },
  
  // टेक्स्ट डिटेल्स (Compact Padding)
  prodName: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginTop: 8, paddingHorizontal: 10 },
  sellerName: { fontSize: 10, color: '#94a3b8', marginTop: 2, fontWeight: '600', paddingHorizontal: 10 },
  comingSoonText: { color: '#9ca3af', marginLeft: 20, marginBottom: 10, fontStyle: 'italic' },
  infoArea: { 
    padding: 8,
    backgroundColor: '#fff',
  },
  // शॉप्स सेक्शन (Professional Look)
  shopsContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    marginTop: 5, 
    flexWrap: 'wrap',
    gap: 8 
  },
  shopCard: { 
    width: '48%', // 2 Shops per line
    backgroundColor: '#fff', 
    padding: 10, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#f1f5f9', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 5, 
    marginBottom: 5 
  },
  shopName: { fontSize: 11, fontWeight: '800', color: '#1e293b', flex: 1 },
  seeAllShopsBtn: { 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc', // हल्का बैकग्राउंड
    borderRadius: 10,
    marginTop: 5
  },
  seeAllShopsText: { color: '#2563eb', fontWeight: 'bold', fontSize: 11, marginTop: 5 },
});

export default CategorySection;
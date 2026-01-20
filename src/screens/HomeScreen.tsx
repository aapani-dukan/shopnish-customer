import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  Pressable,
  ScrollView as RNScrollView,
} from "react-native";
import api from "../services/api";
import { useQuery } from "@tanstack/react-query";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Sparkles, 
  Plus, 
  MapPin as MapPinIcon, 
  CheckCircle2,
  ChevronRight 
} from "lucide-react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import LocationHeader from '../components/LocationHeader';
import { useLocation } from '../context/LocationContext';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { MASTER_CATALOG } from './MasterData';
const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const { currentLocation } = useLocation();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const handleBannerPress = (item: any) => {
  if (!item.actionValue) return;

  switch (item.actionType) {
    case 'CATEGORY':
      // Banner click par category filter apply karega ya category screen par jayega
      setSelectedCategoryId(Number(item.actionValue));
      break;
    case 'PRODUCT':
      // Direct product page par bhej dega
      navigation.navigate('ProductDetails', { productId: item.actionValue });
      break;
    case 'SEARCH':
      // Search screen par bhej dega specific query ke saath
      navigation.navigate('Search', { initialQuery: item.actionValue });
      break;
    default:
      console.log("Unknown action type");
  }
};
  // 1. Fetch Categories
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  // 2. Fetch Products (इसको अपडेट करें)
const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = useQuery<any>({
  queryKey: ["/api/products", currentLocation?.pincode], // ✅ यहाँ से selectedCategoryId हटा दें
  queryFn: async () => {
    const queryParams: any = {
      lat: currentLocation?.latitude || 25.4419,
      lng: currentLocation?.longitude || 75.6597,
      pincode: currentLocation?.pincode || "" 
    };
    // ✅ यहाँ से 'if (selectedCategoryId)' वाली लाइन हटा दें ताकि सारे प्रोडक्ट्स आएं
    const res = await api.get("/api/products", { params: queryParams });
    return res.data; 
  },
  enabled: true,
});
  // 3. Fetch Home Layout (Banners)
const { data: layoutSections = [], isLoading: layoutLoading } = useQuery<any[]>({
  queryKey: ["/api/layout/public", currentLocation?.pincode],
  queryFn: async () => {
    const res = await api.get(`/api/layout/public`, {
      params: { pincode: currentLocation?.pincode  }
    });
    return res.data;
  },
  enabled: !!currentLocation?.pincode,
});
  const products = productsData?.products || [];
  

  // 👇 यहाँ ये दो लाइनें चिपका दें
  console.log("DEBUG_PROD_SAMPLE:", JSON.stringify(products[0], null, 2));
  console.log("DEBUG_CAT_SAMPLE:", JSON.stringify(categories[0], null, 2));
// --- नया ग्रिड लॉजिक (3-3 Products) ---
  const renderMallGrid = (categoryItems: any[], type: string) => (
    <View style={styles.newGrid}>
      {categoryItems.slice(0, 6).map((item) => (
        <TouchableOpacity 
          key={item.id || item._id} 
          style={styles.newProductCard}
          onPress={() => {
            // आपका बताया हुआ लॉजिक: यूनिक है तो शॉप पर, ब्रांडेड है तो प्रोडक्ट पर
            if (type === 'UNIQUE') {
              navigation.navigate('ShopDetails', { sellerId: item.sellerId });
            } else {
              navigation.navigate('ProductDetails', { productId: item.id || item._id });
            }
          }}
        >
          <View style={styles.newImageContainer}>
            <Image source={{ uri: item.image }} style={styles.newProdImage} />
          </View>
          <Text numberOfLines={1} style={styles.newProdName}>{item.name}</Text>
          <Text style={styles.newProdPrice}>₹{item.price}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // --- नया शॉप रो (2 Shops) ---
  const renderMallShops = (categoryShops: any[]) => (
    <View style={styles.shopRow}>
      {categoryShops.slice(0, 2).map((shop) => (
        <TouchableOpacity key={shop.id} style={styles.newShopCard}>
           <Text style={styles.newShopName} numberOfLines={1}>🏪 {shop.businessName}</Text>
           <ChevronRight size={14} color="#94a3b8" />
        </TouchableOpacity>
      ))}
    </View>
  );
  // 🏛️ Address Selector Modal Component
  const AddressSelectorModal = () => (
    <Modal
      visible={isAddressModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsAddressModalVisible(false)}
    >
      <Pressable style={styles.modalOverlay} onPress={() => setIsAddressModalVisible(false)} />
      <View style={styles.addressSheet}>
        <View style={styles.dragHandle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Delivery Address</Text>
          <TouchableOpacity 
            style={styles.addNewBtn}
            onPress={() => {
              setIsAddressModalVisible(false);
              navigation.navigate('Addresses'); // Goes to your Add Address screen
            }}
          >
            <Plus size={18} color="#2563eb" />
            <Text style={styles.addNewText}>Add New</Text>
          </TouchableOpacity>
        </View>

        <RNScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.addressOption} onPress={() => setIsAddressModalVisible(false)}>
            <View style={styles.addressIconBox}>
              <MapPinIcon size={20} color="#2563eb" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.addressLabel}>Current Location</Text>
              <Text style={styles.addressSub} numberOfLines={1}>
                {currentLocation?.pincode ? `Pincode: ${currentLocation.pincode}` : 'Bundi, Rajasthan'}
              </Text>
            </View>
            <CheckCircle2 size={22} color="#2563eb" />
          </TouchableOpacity>

          <Text style={styles.savedLabel}>SAVED ADDRESSES</Text>
          {/* Yahan aap backend se saved addresses map kar sakte hain */}
          <View style={styles.emptyAddressInfo}>
            <Text style={styles.emptyAddressText}>Manage your addresses in Profile or Add New above.</Text>
          </View>
        </RNScrollView>
      </View>
    </Modal>
  );

  const ListHeader = () => (
    <View style={styles.headerContent}>
      {/* 1. Search Bar (वही पुराना) */}
      <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Search')}>
        <Search size={20} color="#94a3b8" />
        <Text style={styles.searchText}>Search products or shops...</Text>
      </TouchableOpacity>

      {/* 2. Banner Section (वही पुराना) */}
      {/* 2. Banner Section (Fix: Dono type ke banners dikhane ke liye) */}
{!selectedCategoryId && layoutSections.length > 0 && (
  <RNScrollView 
    horizontal 
    pagingEnabled 
    showsHorizontalScrollIndicator={false} 
    contentContainerStyle={styles.bannerContainer}
  >
    {layoutSections
      .filter(s => s.sectionType === 'main_banner' || s.sectionType === 'HERO_BANNER') // ✅ Dono ko add kiya
      .map((section: any) => (
        <TouchableOpacity 
          key={section.id} 
          style={styles.bannerWrapper} 
          onPress={() => handleBannerPress(section.config.items[0])}
        >
          <Image source={{ uri: section.config.items[0]?.image }} style={styles.bannerImage} />
        </TouchableOpacity>
      ))}
  </RNScrollView>
)}

      {/* 3. NEW: बिल्कुल छोटे Category Icons (Database Emoji Support) */}
<RNScrollView 
  horizontal 
  showsHorizontalScrollIndicator={false} 
  contentContainerStyle={{ paddingLeft: 20, paddingVertical: 15 }}
>
  {categories.map((item: any) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.miniCatItem} 
      onPress={() => setSelectedCategoryId(item.id)}
    >
      <View style={[
        styles.miniCatCircle, 
        selectedCategoryId === item.id && { borderColor: '#2563eb', borderWidth: 2 },
        { justifyContent: 'center', alignItems: 'center' } // इमोजी को सेंटर में रखने के लिए
      ]}>
        
        {/* ✅ यहाँ 'icon' कॉलम से इमोजी दिखा रहे हैं */}
        {item.icon ? (
          <Text style={{ fontSize: 28 }}>{item.icon}</Text> 
        ) : (
          <Image source={{ uri: item.image }} style={styles.catImage} />
        )}
        
      </View>
      <Text style={styles.miniCatText}>{item.name}</Text>
    </TouchableOpacity>
  ))}
</RNScrollView>

{/* 4. THE MAGIC: Category-wise Sections (Mall Layout) */}

    {!selectedCategoryId && categories.map((cat: any) => {
  
  // ✅ यह फ़िल्टर सबसे सटीक है
  const categoryProducts = products.filter((p: any) => {
    // डेटाबेस वाले कॉलम का नाम यहाँ बिल्कुल सही लिखें
    const prodCatId = p.categoryId; 
    const currentCatId = cat.id;

    // दोनों को String में बदलकर और खाली जगह साफ़ करके मैच करें
    return String(prodCatId).trim() === String(currentCatId).trim();
  }).slice(0, 6);

  return (
    <View key={cat.id} style={styles.mallSection}>
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 22, marginRight: 8 }}>{cat.icon}</Text> 
          <Text style={styles.mallSectionTitle}>{cat.name}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('CategoryDetails', { catId: cat.id, catName: cat.name })}>
          <Text style={styles.clearBtn}>सब देखें</Text>
        </TouchableOpacity>
      </View>
      
      {/* 🟢 अब यहाँ 'cat.products' की जगह 'categoryProducts' लिखें */}
      {categoryProducts.length > 0 ? (
        <View style={styles.gridContainer}>
          {renderMallGrid(categoryProducts, 'grid')}
        </View>
      ) : (
        <View>
           <Text style={{ color: '#9ca3af', marginLeft: 20 }}>
             जल्द आ रहा है... (Debug: P-Cat: {products[0]?.categoryId} | C-ID: {cat.id})
           </Text>
        </View>
      )}  
      
    {/* Shops - अब यहाँ डमी डेटा की जगह cat.shops का इस्तेमाल करें */}
    {/* Har Category ke niche real shops dikhane ke liye */}
{cat.shops && cat.shops.length > 0 ? (
  <View>
    {renderMallShops(cat.shops.slice(0, 2))} {/* Pehli 2 shops */}
    
    {cat.shops.length > 2 && (
      <TouchableOpacity 
        style={{ padding: 10, alignItems: 'center' }}
        onPress={() => navigation.navigate('CategoryShops', { catId: cat.id, catName: cat.name })}
      >
        <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>
          See All {cat.shops.length} Shops in {cat.name} →
        </Text>
      </TouchableOpacity>
    )}
  </View>
) : (
  <Text style={{ paddingLeft: 20, color: '#94a3b8', fontSize: 12 }}>
    No shops available in this category yet.
  </Text>
)}

    {/* Section Divider for High-Class look */}
    <View style={styles.divider} />
  </View>
)
})}

<View style={styles.sectionHeader}>
  <Text style={styles.sectionTitle}>Trending Products Nearby</Text>
</View>
</View>
  );
      

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Main Top Header */}
      <View style={styles.mainHeader}>
        <TouchableOpacity 
          activeOpacity={0.7} 
          onPress={() => setIsAddressModalVisible(true)} 
          style={styles.locationContainer}
        >
           <LocationHeader />
        </TouchableOpacity>
        
        <TouchableOpacity 
            style={styles.cartBtn} 
            onPress={() => navigation.navigate('Cart')}
        >
            <ShoppingBag color="#1e293b" size={24} />
            {cartCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
            )}
        </TouchableOpacity>
      </View>

      <AddressSelectorModal />

      {productsLoading && products.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item: any) => `prod-${item.id || item._id}`} 
          ListHeaderComponent={ListHeader} 
          renderItem={({ item }: any) => (
            <TouchableOpacity 
              activeOpacity={0.9}
              style={styles.productCard}
              onPress={() => navigation.navigate('ProductDetails', { productId: item.id || item._id })}
            >
              <View style={styles.imageContainer}>
                  <Image source={{ uri: item.image }} style={styles.prodImage} />
                  <View style={styles.priceTag}>
                      <Text style={styles.priceText}>₹{item.price}</Text>
                  </View>
              </View>
              <View style={styles.prodInfo}>
                <Text style={styles.prodName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.sellerName}>
                   {item.seller?.businessName || "Premium Boutique"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          columnWrapperStyle={styles.rowWrapper}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetchProducts}
          refreshing={productsLoading}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found nearby.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mainHeader: { 
    flexDirection: 'row', justifyContent: 'space-between', 
    alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f8fafc'
  },
  locationContainer: { flex: 1, marginRight: 15 },
  cartBtn: { 
    width: 45, height: 45, borderRadius: 15, 
    backgroundColor: '#f1f5f9', justifyContent: 'center', 
    alignItems: 'center', position: 'relative' 
  },
  badge: { 
    position: 'absolute', top: -5, right: -5, 
    backgroundColor: '#2563eb', width: 20, height: 20, 
    borderRadius: 10, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff'
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  headerContent: { backgroundColor: '#fff' },
  searchBar: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#f8fafc', margin: 20, padding: 15, 
    borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9' 
  },
  searchText: { flex: 1, marginLeft: 10, color: '#94a3b8', fontSize: 15 },
  sectionHeader: { 
    paddingHorizontal: 20, paddingVertical: 15, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' 
  },
  bannerContainer: { paddingHorizontal: 20, marginBottom: 10 },
  bannerWrapper: {
    width: width - 40,
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: '#f1f5f9'
  },
  bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bannerTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  clearBtn: { color: '#2563eb', fontWeight: 'bold' },
  catItem: { alignItems: 'center', marginRight: 22 },
  catCircle: {
    width: 65,         // Aap apne hisaab se size badha sakte hain
    height: 65,
    borderRadius: 32.5, 
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // ✅ Ye sabse important hai cover ke liye
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedCatCircle: { backgroundColor: '#2563eb', borderColor: '#2563eb', elevation: 8, shadowColor: '#2563eb', shadowOpacity: 0.4, shadowRadius: 10 },
  catImage: { 
    width: '100%',     // ✅ Circle ki poori width lega
    height: '100%',    // ✅ Circle ki poori height lega
    resizeMode: 'cover' // ✅ Image ko poora fill kar dega (Premium look)
},
  catText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  selectedCatText: { color: '#0f172a' },
  rowWrapper: { justifyContent: 'space-between', paddingHorizontal: 20 },
  productCard: { 
    width: (width / 2) - 28, backgroundColor: '#fff', 
    borderRadius: 24, marginBottom: 20, elevation: 5,
    borderWidth: 1, borderColor: '#f1f5f9'
  },
  imageContainer: { position: 'relative', width: '100%', height: 160, overflow: 'hidden', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  prodImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  priceTag: { 
    position: 'absolute', bottom: 10, left: 10, 
    backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 10, 
    paddingVertical: 5, borderRadius: 12 
  },
  priceText: { fontSize: 14, fontWeight: '900', color: '#0f172a' },
  prodInfo: { padding: 15 },
  prodName: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  sellerName: { fontSize: 11, color: '#94a3b8', marginTop: 4, fontWeight: '600' },
  emptyContainer: { padding: 50, alignItems: 'center' },
  emptyText: { color: '#94a3b8', fontWeight: '600' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  addressSheet: { 
    height: '50%', backgroundColor: '#fff', 
    borderTopLeftRadius: 35, borderTopRightRadius: 35, 
    padding: 25, position: 'absolute', bottom: 0, width: width,
    shadowColor: '#000', shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1, shadowRadius: 20, elevation: 25
  },
  dragHandle: { width: 40, height: 5, backgroundColor: '#e2e8f0', alignSelf: 'center', marginBottom: 25, borderRadius: 10 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  sheetTitle: { fontSize: 22, fontWeight: '900', color: '#0f172a' },
  addNewBtn: { 
    flexDirection: 'row', alignItems: 'center', gap: 6, 
    backgroundColor: '#eff6ff', paddingHorizontal: 12, 
    paddingVertical: 8, borderRadius: 12 
  },
  addNewText: { color: '#2563eb', fontWeight: '800', fontSize: 14 },
  addressOption: { 
    flexDirection: 'row', alignItems: 'center', 
    padding: 20, backgroundColor: '#f8fafc', 
    borderRadius: 24, marginBottom: 15, 
    borderWidth: 1, borderColor: '#e2e8f0' 
  },
  addressIconBox: { 
    width: 48, height: 48, borderRadius: 16, 
    backgroundColor: '#fff', justifyContent: 'center', 
    alignItems: 'center', marginRight: 15, elevation: 2 
  },
  addressLabel: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  addressSub: { fontSize: 13, color: '#64748b', marginTop: 4 },
  savedLabel: { 
    fontSize: 12, fontWeight: '900', color: '#94a3b8', 
    letterSpacing: 1, marginTop: 10, marginBottom: 15 
  },
  

  // ✅ इस नए स्टाइल को यहाँ जोड़ें
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',         // यह 6 प्रोडक्ट्स को 2 लाइन में लाने के लिए सबसे ज़रूरी है
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    marginTop: 10,
  },

  // अगर आपने ये भी नहीं जोड़े हैं, तो इन्हें भी डाल दें ताकि एरर न आए:
  divider: {
    height: 8,
    backgroundColor: '#f3f4f6',
    marginTop: 20,
    marginBottom: 10,
  },
  
  emptyAddressInfo: { padding: 20, alignItems: 'center' },
  emptyAddressText: { color: '#94a3b8', fontSize: 13, textAlign: 'center' }
,
mallSection: { marginTop: 5, borderBottomWidth: 8, borderBottomColor: '#f8fafc', paddingBottom: 20 },
  mallSectionTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  miniCatItem: { alignItems: 'center', marginRight: 18 },
  miniCatCircle: { width: 50, height: 50, borderRadius: 25, overflow: 'hidden', backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  miniCatText: { fontSize: 11, fontWeight: '700', marginTop: 4, color: '#64748b' },
  newGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, justifyContent: 'space-between' },
  newProductCard: { width: (width / 3) - 18, marginBottom: 15, alignItems: 'center' },
  newImageContainer: { width: '100%', height: 90, borderRadius: 18, backgroundColor: '#f8fafc', overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' },
  newProdImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  newProdName: { fontSize: 11, fontWeight: '700', marginTop: 6, color: '#1e293b', textAlign: 'center' },
  newProdPrice: { fontSize: 12, fontWeight: '900', color: '#2563eb' },
  shopRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 5 },
  newShopCard: { width: '48%', backgroundColor: '#fff', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  newShopName: { fontSize: 12, fontWeight: '800', color: '#1e293b', flex: 1 },
});
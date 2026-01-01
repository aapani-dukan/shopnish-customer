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

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const { currentLocation } = useLocation();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  // 1. Fetch Categories
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  // 2. Fetch Products
  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = useQuery<any>({
    queryKey: ["/api/products", selectedCategoryId, currentLocation?.pincode],
    queryFn: async () => {
      const queryParams: any = {
        lat: currentLocation?.latitude || 25.4419,
        lng: currentLocation?.longitude || 75.6597,
        pincode: currentLocation?.pincode || "323001" 
      };
      if (selectedCategoryId) queryParams.categoryId = selectedCategoryId;
      const res = await api.get("/api/products", { params: queryParams });
      return res.data; 
    },
    enabled: true,
  });
  
  const products = productsData?.products || [];

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
      {/* Search Bar */}
      <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Search')}>
        <Search size={20} color="#94a3b8" />
        <Text style={styles.searchText}>Search premium products...</Text>
        <Filter size={18} color="#2563eb" />
      </TouchableOpacity>

      {/* Categories Section */}
      <View style={styles.sectionHeader}>
        <View style={styles.row}>
           <Sparkles size={18} color="#f59e0b" fill="#f59e0b" />
           <Text style={styles.sectionTitle}>Exclusive Categories</Text>
        </View>
        {selectedCategoryId && (
          <TouchableOpacity onPress={() => setSelectedCategoryId(null)}>
             <Text style={styles.clearBtn}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item: any) => `cat-${item.id}`}
        renderItem={({ item }: any) => {
          const isSelected = selectedCategoryId === item.id;
          return (
            <TouchableOpacity 
              activeOpacity={0.7}
              style={styles.catItem} 
              onPress={() => setSelectedCategoryId(isSelected ? null : item.id)}
            >
              <View style={[styles.catCircle, isSelected && styles.selectedCatCircle]}>
                <Image source={{ uri: item.image }} style={styles.catImage} />
              </View>
              <Text style={[styles.catText, isSelected && styles.selectedCatText]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingLeft: 20, paddingBottom: 10 }}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
            {selectedCategoryId ? "Filtered Results" : "Trending Now"}
        </Text>
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  clearBtn: { color: '#2563eb', fontWeight: 'bold' },
  catItem: { alignItems: 'center', marginRight: 22 },
  catCircle: { 
    width: 70, height: 70, borderRadius: 24, 
    backgroundColor: '#f8fafc', justifyContent: 'center', 
    alignItems: 'center', marginBottom: 8,
    borderWidth: 1, borderColor: '#f1f5f9'
  },
  selectedCatCircle: { backgroundColor: '#2563eb', borderColor: '#2563eb', elevation: 8, shadowColor: '#2563eb', shadowOpacity: 0.4, shadowRadius: 10 },
  catImage: { width: 45, height: 45, resizeMode: 'contain' },
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
  emptyAddressInfo: { padding: 20, alignItems: 'center' },
  emptyAddressText: { color: '#94a3b8', fontSize: 13, textAlign: 'center' }
});
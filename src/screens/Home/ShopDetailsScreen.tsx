import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Star, MapPin, Share2 } from 'lucide-react-native';
import api from '../../services/api';

const { width } = Dimensions.get('window');

export default function ShopDetailsScreen({ route, navigation }: any) {
  const { sellerId, shopName } = route.params;

  // 1. Fetch Products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', 'shop', sellerId],
    queryFn: async () => {
      const res = await api.get('/api/products', { params: { sellerId } });
      return res.data.products || [];
    },
  });

  // 2. Derive Categories from products (for filter tabs)
 const shopCategories = useMemo<string[]>(() => {
  if (!products || products.length === 0) return ['All'];

  const cats = products.map((p: any) => String(p.categoryName || 'General'));
  
  // Set के बाद .filter(Boolean) और explicit casting करें
  const uniqueCats = Array.from(new Set(cats)) as string[]; 
  
  return ['All', ...uniqueCats];
}, [products]);

  const ListHeader = () => (
    <View style={styles.shopHeader}>
      {/* Shop Profile Section */}
      <View style={styles.profileInfo}>
        <View style={styles.shopLogoContainer}>
          <Text style={styles.logoInitial}>{shopName?.charAt(0)}</Text>
        </View>
        <View style={styles.shopDetailsText}>
          <Text style={styles.shopTitle}>{shopName}</Text>
          <View style={styles.metaRow}>
            <View style={styles.ratingBadge}>
              <Star size={12} color="#fff" fill="#fff" />
              <Text style={styles.ratingText}>4.5</Text>
            </View>
            <View style={styles.dot} />
            <Text style={styles.metaText}>Premium Seller</Text>
          </View>
          <View style={styles.locationRow}>
             <MapPin size={12} color="#64748b" />
             <Text style={styles.locationText}>Bundi, Rajasthan</Text>
          </View>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
           <Text style={styles.statValue}>{products.length}</Text>
           <Text style={styles.statLabel}>Products</Text>
        </View>
        <View style={styles.vDivider} />
        <View style={styles.statItem}>
           <Text style={styles.statValue}>100+</Text>
           <Text style={styles.statLabel}>Happy Users</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Category Tabs (Can be made sticky) */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={shopCategories}
        contentContainerStyle={styles.tabContainer}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.tab, item === 'All' && styles.activeTab]}>
            <Text style={[styles.tabText, item === 'All' && styles.activeTabText]}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  if (isLoading) return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;

  return (
    <View style={styles.container}>
      {/* Floating Action Header */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navIcon}>
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>{shopName}</Text>
        <TouchableOpacity style={styles.navIcon}>
          <Share2 size={20} color="#1e293b" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        numColumns={2}
        ListHeaderComponent={ListHeader}
        keyExtractor={(item) => String(item.id || item._id)}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <TouchableOpacity 
            activeOpacity={0.9}
            style={styles.card}
            onPress={() => navigation.navigate('ProductDetails', { productId: item.id || item._id })}
          >
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.image }} style={styles.img} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <View style={styles.priceRow}>
                 <Text style={styles.priceSymbol}>₹</Text>
                 <Text style={styles.priceValue}>{item.price}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 50 : 20, paddingBottom: 15,
    backgroundColor: '#fff', zIndex: 10
  },
  navIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', flex: 1, textAlign: 'center' },
  
  shopHeader: { paddingHorizontal: 16, paddingTop: 10 },
  profileInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  shopLogoContainer: { 
    width: 80, height: 80, borderRadius: 24, backgroundColor: '#2563eb', 
    justifyContent: 'center', alignItems: 'center', elevation: 5 
  },
  logoInitial: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  shopDetailsText: { marginLeft: 16, flex: 1 },
  shopTitle: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingBadge: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#10b981', 
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, gap: 4 
  },
  ratingText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#cbd5e1', marginHorizontal: 8 },
  metaText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  locationText: { fontSize: 12, color: '#94a3b8' },

  statsRow: { 
    flexDirection: 'row', justifyContent: 'space-around', 
    backgroundColor: '#f8fafc', borderRadius: 20, padding: 15, marginBottom: 20 
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '900', color: '#1e293b' },
  statLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  vDivider: { width: 1, height: '80%', backgroundColor: '#e2e8f0' },
  
  divider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 20 },
  
  tabContainer: { paddingBottom: 15 },
  tab: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12, marginRight: 10, backgroundColor: '#f1f5f9' },
  activeTab: { backgroundColor: '#2563eb' },
  tabText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
  activeTabText: { color: '#fff' },

  columnWrapper: { justifyContent: 'space-between', paddingHorizontal: 16 },
  card: { width: (width / 2) - 24, marginBottom: 20, backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden' },
  imageContainer: { width: '100%', height: 160, backgroundColor: '#f8fafc' },
  img: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardInfo: { padding: 12 },
  name: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 5, gap: 2 },
  priceSymbol: { fontSize: 12, fontWeight: '900', color: '#2563eb' },
  priceValue: { fontSize: 16, fontWeight: '900', color: '#2563eb' },
});
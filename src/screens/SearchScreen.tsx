import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, ScrollView, 
  TouchableOpacity, Image, Dimensions, ActivityIndicator, FlatList 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query'; // Query के लिए
import api from '../services/api'; // अपना API इंस्टेंस चेक करें

const { width } = Dimensions.get('window');

export default function SearchScreen({ route, navigation }: any) {
  // 1. Params से लोकेशन डेटा लें (जो SearchBar से आ रहा है)
  const { pincode, lat, lng } = route.params || {};
  const [searchQuery, setSearchQuery] = useState('');

  // 2. Real-time Search Logic
  const { data: products = [], isLoading, isFetching } = useQuery({
    queryKey: ['search', searchQuery, pincode],
    queryFn: async () => {
      if (searchQuery.length < 2) return [];
      const res = await api.get('/api/products', {
        params: {
          search: searchQuery,
          pincode: pincode, // ✅ बैकएंड को शांत रखने के लिए
          lat: lat,
          lng: lng
        }
      });
      return res.data.products || [];
    },
    enabled: searchQuery.length >= 2, // 2 अक्षर के बाद ही API कॉल होगी
  });

  return (
    <View style={styles.container}>
      {/* 1. Header & Search Bar */}
      <View style={styles.header}>
        <View style={styles.topRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Feather name="chevron-left" size={28} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.title}>Explore</Text>
        </View>
        
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products or stores..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true} // ✅ स्क्रीन खुलते ही कीबोर्ड हाजिर
            placeholderTextColor="#94A3B8"
          />
          {(isLoading || isFetching) && <ActivityIndicator size="small" color="#2563eb" />}
          {searchQuery.length > 0 && !isLoading && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 2. Results or Suggestions */}
      {searchQuery.length >= 2 ? (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.resultItem}
              onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
            >
              <Image source={{ uri: item.image }} style={styles.resultImage} />
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultSeller}>{item.seller?.businessName}</Text>
                <Text style={styles.resultPrice}>₹{item.price}</Text>
              </View>
              <Feather name="arrow-up-right" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={!isLoading ? (
            <Text style={styles.noResultText}>आपके एरिया में कोई मैच नहीं मिला।</Text>
          ) : null}
        />
      ) : (
        <ScrollView>
             {/* यहाँ आपका Trending Searches और Categories वाला पुराना कोड रहेगा */}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '900', color: '#1E293B', marginBottom: 20 },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F1F5F9', 
    paddingHorizontal: 15, 
    height: 55, 
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1E293B', fontWeight: '500' },
  section: { paddingHorizontal: 20, marginTop: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 15 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    marginRight: 10, 
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  chipText: { color: '#64748B', fontWeight: '600', fontSize: 14 },
  categoryGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  categoryCard: { 
    width: (width - 60) / 4, 
    alignItems: 'center', 
    backgroundColor: '#F8FAFC', 
    paddingVertical: 15, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  categoryIcon: { fontSize: 24, marginBottom: 8 },
  categoryName: { fontSize: 12, fontWeight: '700', color: '#475569' },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyIconCircle: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: '#F8FAFC', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 15
  },
   emptyText: { fontSize: 16, color: '#94A3B8', fontWeight: '600' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  resultItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    marginBottom: 15, 
    padding: 10, 
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#F1F5F9' 
  },
  resultImage: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#F8FAFC' },
  resultInfo: { flex: 1, marginLeft: 15 },
  resultName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  resultSeller: { fontSize: 12, color: '#64748B', marginTop: 2 },
  resultPrice: { fontSize: 14, fontWeight: '800', color: '#2563eb', marginTop: 4 },
  noResultText: { textAlign: 'center', marginTop: 50, color: '#94A3B8', fontWeight: '600' }

 
});
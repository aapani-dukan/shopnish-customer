import React from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function CategoryDetailsScreen({ route, navigation }: any) {
  const { catId, catName,pincode, lat, lng } = route.params;

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products', 'category', catId, pincode, lat, lng],
    queryFn: async () => {
      // params के अंदर डिफ़ॉल्ट वैल्यूज़ (Fallback)
const res = await api.get('/api/products', { 
  params: { 
    categoryId: catId, 
    pincode: pincode || '', 
    lat: lat || 0, 
    lng: lng || 0 
  } 
});
      return res.data.products || [];
    },
  });
if (error) {
    console.error("❌ API Error in Category Screen:", error);
  }
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!isLoading && products.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#64748b' }}>No products found in this category.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{catName}</Text>
      </View>

      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => String(item.id || item._id)}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('ProductDetails', { productId: item.id || item._id })}
          >
            <Image source={{ uri: item.image }} style={styles.img} />
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.price}>₹{item.price}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#eee' },
  backBtn: { fontSize: 18, color: '#2563eb' },
  title: { fontSize: 22, fontWeight: '900', marginLeft: 10, color: '#1e293b' },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  img: { width: '100%', height: 150, borderTopLeftRadius: 16, borderTopRightRadius: 16, resizeMode: 'cover' },
  name: { fontSize: 14, fontWeight: '600', marginTop: 5 },
  price: { fontSize: 14, color: '#2563eb', fontWeight: 'bold', marginTop: 2 },
});
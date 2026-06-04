import React from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
const { width } = Dimensions.get('window');

export default function CategoryDetailsScreen({ route, navigation }: any) {
  const { catId, catName, pincode, lat, lng } = route.params || {};

  // 1. Category wise Products Fetching with Location Safety
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products', 'category', catId, pincode, lat, lng],
    queryFn: async () => {
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
        <Text style={{ color: '#64748b', fontWeight: '600' }}>No products found in this category.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Block */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backWrapper}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{catName || "Category"}</Text>
        <View style={{ width: 50 }} /> {/* बैलेंसिंग के लिए स्पेस भाई */}
      </View>

      {/* Products Grid */}
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => String(item.id || item._id)}
        contentContainerStyle={{ padding: 10, paddingBottom: 40 }}
        columnWrapperStyle={styles.rowBetween}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          // 🎯 फिक्स 1: प्रोडक्ट के वैरिएंट्स में से न्यूनतम बेस प्राइस ढूंढना भाई ताकि रेट ₹0 न दिखे
          const variantsList = item.variants || [];
          const basePrice = variantsList.length > 0 
            ? Math.min(...variantsList.map((v: any) => Number(v.price || 0)))
            : Number(item.price || 0);

          // चेक करो कि क्या इस प्रोडक्ट के एक से ज़्यादा वैरिएंट्स मौजूद हैं भाई
          const hasMultipleVariants = variantsList.length > 1;

          return (
            <TouchableOpacity 
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('ProductDetails', { productId: item.id || item._id })}
            >
              <View style={styles.imgContainer}>
                <Image source={{ uri: item.image }} style={styles.img} />
              </View>
              <View style={styles.infoBlock}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.sellerName} numberOfLines={1}>
                  {item.seller?.businessName || "Verified Shop"}
                </Text>
                
                {/* 🎯 फिक्स 2: अगर मल्टीपल वजन/साइज हैं तो 'From ₹XX' चमकाओ भाई */}
                <Text style={styles.price}>
                  {hasMultipleVariants ? (
                    <Text style={styles.fromText}>From </Text>
                  ) : null}
                  ₹{basePrice}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingTop: 50, 
    paddingBottom: 15, 
    paddingHorizontal: 15, 
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  backWrapper: { paddingVertical: 5, paddingRight: 10 },
  backBtn: { color: '#2563eb', fontSize: 16, fontWeight: '700' },
  title: { fontSize: 20, fontWeight: '900', color: '#0f172a', flex: 1, textAlign: 'center' },
  rowBetween: { justifyContent: 'space-between' },
  card: { 
    backgroundColor: '#fff', 
    width: (width - 30) / 2, 
    borderRadius: 16, 
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    overflow: 'hidden'
  },
  imgContainer: { width: '100%', height: 130, backgroundColor: '#f8fafc', padding: 10 },
  img: { width: '100%', height: '100%', resizeMode: 'contain' },
  infoBlock: { padding: 12 },
  name: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  sellerName: { fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: '500' },
  price: { fontSize: 15, fontWeight: '900', color: '#0f172a', marginTop: 6 },
  fromText: { fontSize: 11, color: '#64748b', fontWeight: '500' }
});
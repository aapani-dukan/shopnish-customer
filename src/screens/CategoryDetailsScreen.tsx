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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!isLoading && products.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#64748b', fontWeight: '600' }}>No products found in this category.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header Block */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 10 }}>
          <Text style={{ fontSize: 16, color: '#2563eb', fontWeight: '600' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a', flex: 1, marginLeft: 10 }} numberOfLines={1}>
          {catName || "Category"}
        </Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Products Grid */}
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => String(item.id || item._id)}
        contentContainerStyle={{ padding: 10, paddingBottom: 40 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
          
          // ==================== 🎯 100% बुलेटप्रूफ यूनिवर्सल डिस्काउंट इंजन भाई साहब ====================
          const variantsList = item.variants || [];
          
          // 1. डेटाबेस की मुख्य वैल्यू को यहाँ वेरिएबल में फेच करें भाई
          let basePrice = Number(item.price || item.variant?.price || 0);
          let baseMrp = Number(item.mrp || item.originalPrice || item.variant?.mrp || item.variant?.originalPrice || 0);

          // 2. सबसे सस्ता वैरिएन्ट ढूँढकर कीमतें लाइव सिंक करें
          if (variantsList.length > 0) {
            const lowestVariant = variantsList.reduce((min: any, v: any) => 
              Number(v.price || 0) < Number(min.price || 0) ? v : min, 
              variantsList[0]
            );
            basePrice = Number(lowestVariant?.price || basePrice);
            baseMrp = Number(lowestVariant?.mrp || lowestVariant?.originalPrice || baseMrp);
          }

          const hasMultipleVariants = variantsList.length > 1;

          // 3. कड़क बिज़नेस डिस्काउंट स्ट्रेटेजी (₹100 रूल फॉर्मूला) भाई साहब
          const savings = baseMrp - basePrice;
          let calculatedDiscountText = '';
          
          if (baseMrp > basePrice && savings > 0) {
            if (savings < 100) {
              calculatedDiscountText = `${Math.round((savings / baseMrp) * 100)}% OFF`;
            } else {
              calculatedDiscountText = `Flat ₹${Math.round(savings)} OFF`;
            }
          }
          // ========================================================================================= 

          // 🌟 कड़क सुधार: सिर्फ एक ही मुख्य 'return' रहेगा जो सीधा आपका यूआई कंपोनेंट रेंडर करेगा भाई!
          return (
            <TouchableOpacity 
              style={{ backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 12, width: (width - 32) / 2 - 5, borderWidth: 1, borderColor: '#e2e8f0' }}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('ProductDetails', { productId: item.id || item._id })}
            >
              <View style={{ width: '100%', height: 120, borderRadius: 8, overflow: 'hidden', backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' }}>
                <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
              </View>
              <View style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e293b' }} numberOfLines={1}>{item.name}</Text>
                <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }} numberOfLines={1}>
                  {item.seller?.businessName || "Verified Shop"}
                </Text>
                
                {/* यूआई प्राइस और डिस्काउंट बैज रेंडर ब्लॉक */}
                <View style={{ marginTop: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                    {hasMultipleVariants && (
                      <Text style={{ fontSize: 11, color: '#64748b', fontWeight: '600' }}>From </Text>
                    )}
                    
                    {/* असली सेलिंग प्राइस */}
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a' }}>
                      ₹{basePrice}
                    </Text>
                    
                    {/* कटी हुई MRP लाइन */}
                    {baseMrp > basePrice ? (
                      <Text style={{ fontSize: 11, color: '#94a3b8', textDecorationLine: 'line-through' }}>
                        ₹{baseMrp}
                      </Text>
                    ) : null}
                  </View>

                  {/* डायनामिक कस्टमाइज्ड बिज़नेस ऑफर बॉक्स बैज */}
                  {calculatedDiscountText ? (
                    <View style={{ backgroundColor: '#f0fdf4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 4 }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: '#16a34a' }}>{calculatedDiscountText}</Text>
                    </View>
                  ) : null}
                </View>

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
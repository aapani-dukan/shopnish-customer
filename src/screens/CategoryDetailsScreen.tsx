import React from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api'; // आपका API पाथ

export default function CategoryDetailsScreen({ route, navigation }: any) {
  const { catId, catName } = route.params;

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', 'category', catId],
    queryFn: async () => {
      const res = await api.get('/api/products', { params: { categoryId: catId } });
      return res.data.products || [];
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{catName}</Text>
      </View>

      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
          >
            <Image source={{ uri: item.image }} style={styles.img} />
            <Text style={styles.name}>{item.name}</Text>
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
  header: { padding: 20, borderBottomWidth: 1, borderColor: '#eee', marginTop: 40 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  card: { flex: 1, margin: 8, backgroundColor: '#f8fafc', borderRadius: 12, padding: 10 },
  img: { width: '100%', height: 150, borderRadius: 8, marginBottom: 8 },
  name: { fontSize: 14, fontWeight: '600' },
  price: { fontSize: 14, color: '#2563eb', fontWeight: 'bold' }
});
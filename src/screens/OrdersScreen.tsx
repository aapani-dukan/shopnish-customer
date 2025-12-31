import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { apiRequest } from '../lib/queryClient'; // Aapka API fetcher
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';

export default function OrdersScreen({ navigation }: any) {
  const { user } = useAuth();

  // ✅ 2. Purane useState aur useEffect ko hata kar sirf ye likhein
  const { 
    data: orders = [], 
    isLoading, 
    refetch, 
    isFetching 
  } = useQuery<any[]>({
    queryKey: ['/api/orders'], // Ye path queryClient apne aap fetch karega
  });

  // Dynamic status color function (vahi purana)
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return '#22c55e';
      case 'out_for_delivery': return '#2563eb';
      case 'preparing': return '#f59e0b';
      default: return '#64748b';
    }
  };

  // 3. Agar data load ho raha hai
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.orderCard}
            onPress={() => navigation.navigate('TrackOrder', { orderId: item.id })}
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.orderIdText}>Order #{item.orderNumber || item.id}</Text>
                <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {item.status?.replace(/_/g, ' ').toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.cardFooter}>
              <Text style={styles.priceLabel}>Total Amount</Text>
              <Text style={styles.priceValue}>₹{item.total}</Text>
              <Feather name="chevron-right" size={20} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="box" size={50} color="#CBD5E1" />
            <Text style={styles.emptyText}>Abhi tak koi order nahi mila bhai!</Text>
          </View>
        }
        // ✅ Pull to refresh ab aur bhi simple hai
        onRefresh={refetch}
        refreshing={isFetching}
      />
    </View>
  );
}

// ... styles purane wale hi rahenge

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#fff' },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#1E293B' },
  listContent: { padding: 20 },
  orderCard: { backgroundColor: '#fff', borderRadius: 20, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderIdText: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  dateText: { fontSize: 12, color: '#64748B', marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  cardBody: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  itemsText: { flex: 1, marginLeft: 10, fontSize: 14, color: '#475569' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: 10, borderRadius: 12 },
  priceLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  priceValue: { fontSize: 16, fontWeight: '900', color: '#1E293B', flex: 1, marginLeft: 10 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, fontSize: 16, color: '#94A3B8', fontWeight: '600' },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#F8FAFC' 
  }
});
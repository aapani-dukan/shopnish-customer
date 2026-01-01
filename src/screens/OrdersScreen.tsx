import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Package, Truck, ChevronRight, Search, Box } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrdersScreen({ navigation }: any) {
  const { data: orders = [], isLoading, refetch, isFetching } = useQuery<any[]>({
    queryKey: ['/api/orders'],
  });

  // 🟢 Web App Wala Status Logic
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return '#22c55e';
      case 'out_for_delivery': case 'in transit': case 'picked_up': return '#2563eb';
      case 'preparing': case 'ready_for_pickup': return '#f59e0b';
      case 'cancelled': case 'rejected': return '#ef4444';
      default: return '#64748b';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item: order }) => {
          // 🟢 Web App FIX 2: Overall Status
          const currentDisplayStatus = order.overallDeliveryStatus || order.status;
          
          // 🟢 Web App FIX 4: Check if any batch is trackable
          const isTrackable = order.deliveryBatches?.some((b: any) => 
            ['picked_up', 'out_for_delivery', 'in transit'].includes(b.status?.toLowerCase())
          );

          return (
            <View style={styles.orderCard}>
              {/* Master Order Info */}
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.orderIdText}>Order #{order.orderNumber}</Text>
                  <Text style={styles.dateText}>{new Date(order.createdAt).toLocaleDateString()}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentDisplayStatus) + '15' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(currentDisplayStatus) }]}>
                    {currentDisplayStatus.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.totalLabel}>Total Amount: </Text>
                <Text style={styles.totalValue}>₹{Number(order.total).toLocaleString('en-IN')}</Text>
              </View>

              {/* 🟢 Web App FIX 3: Batch-wise Display */}
              {order.deliveryBatches && order.deliveryBatches.length > 0 && (
                <View style={styles.batchContainer}>
                  <Text style={styles.batchTitle}>
                    <Truck size={16} color="#2563eb" /> Delivery Batches ({order.deliveryBatches.length})
                  </Text>
                  
                  {order.deliveryBatches.map((batch: any) => (
                    <View key={batch.id} style={styles.batchCard}>
                      <View style={styles.batchInfo}>
                        <Text style={styles.batchIdText}>Batch #{batch.id}</Text>
                        <View style={[styles.miniBadge, { backgroundColor: getStatusColor(batch.status) }]}>
                          <Text style={styles.miniBadgeText}>{batch.status.replace(/_/g, ' ')}</Text>
                        </View>
                      </View>
                      <Text style={styles.riderText}>
                        Rider: {batch.deliveryBoy?.name || "Assigning soon..."}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={styles.detailsBtn}
                  onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
                >
                  <Text style={styles.detailsBtnText}>View Details</Text>
                </TouchableOpacity>

                {isTrackable && (
                  <TouchableOpacity 
                    style={styles.trackBtn}
                    onPress={() => navigation.navigate('TrackOrder', { orderId: order.id })}
                  >
                    <Text style={styles.trackBtnText}>Live Tracking</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
        onRefresh={refetch}
        refreshing={isFetching}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Box size={50} color="#CBD5E1" />
            <Text style={styles.emptyText}>No orders found!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FE' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#1E293B' },
  listContent: { padding: 15 },
  orderCard: { backgroundColor: '#fff', borderRadius: 20, padding: 15, marginBottom: 15, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderIdText: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  dateText: { fontSize: 12, color: '#64748B' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800' },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  totalLabel: { fontSize: 14, color: '#64748B' },
  totalValue: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  // Batch Styles
  batchContainer: { backgroundColor: '#F8FAFC', borderRadius: 15, padding: 12, marginBottom: 15 },
  batchTitle: { fontSize: 13, fontWeight: 'bold', color: '#1E293B', marginBottom: 10 },
  batchCard: { backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  batchInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  batchIdText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  miniBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  miniBadgeText: { fontSize: 9, color: '#fff', fontWeight: 'bold', textTransform: 'uppercase' },
  riderText: { fontSize: 11, color: '#94A3B8', marginTop: 4 },
  // Buttons
  buttonRow: { flexDirection: 'row', gap: 10 },
  detailsBtn: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  detailsBtnText: { fontSize: 13, fontWeight: '700', color: '#475569' },
  trackBtn: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#7C3AED', alignItems: 'center' },
  trackBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, color: '#94A3B8' }
});
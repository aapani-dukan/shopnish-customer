import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Package, MapPin, Phone, Store, Clock, ChevronLeft, CreditCard, CheckCircle2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrderDetailsScreen({ route, navigation }: any) {
  const { orderId } = route.params;

  // Web App waali API use kar rahe hain jo detailed tracking/order data deti hai
  const { data: order, isLoading } = useQuery<any>({
    queryKey: [`/api/orders/${orderId}/tracking`],
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  const getStatusColor = (status: string = "") => {
    const s = status.toLowerCase();
    if (['delivered'].includes(s)) return '#10b981';
    if (['cancelled', 'rejected'].includes(s)) return '#ef4444';
    return '#7c3aed';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Order Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusInfo}>
            <Text style={styles.orderIdText}>Order #{order?.masterOrderNumber}</Text>
            <Text style={styles.dateText}>{new Date(order?.createdAt).toLocaleString()}</Text>
          </View>
          <View style={[styles.mainStatusBadge, { backgroundColor: getStatusColor(order?.status) }]}>
            <Text style={styles.mainStatusText}>{order?.status?.toUpperCase()}</Text>
          </View>
        </View>

        {/* 🟢 Web Logic: Delivery Batches (Multi-Seller support) */}
        <Text style={styles.sectionTitle}>Shipments & Sellers</Text>
        {order?.deliveryBatchesSummary?.map((batch: any, index: number) => (
          <View key={index} style={styles.batchContainer}>
            <View style={styles.batchHeader}>
              <View style={styles.batchIdBox}>
                <Package size={16} color="#7c3aed" />
                <Text style={styles.batchIdText}>Shipment #{batch.batchId}</Text>
              </View>
              <Text style={[styles.batchStatusText, { color: getStatusColor(batch.batchStatus) }]}>
                {batch.batchStatus.replace(/_/g, ' ')}
              </Text>
            </View>

            {/* Sub-orders in this batch */}
            {batch.subOrders.map((so: any) => (
              <View key={so.subOrderId} style={styles.sellerRow}>
                <View style={styles.sellerInfo}>
                  <Store size={18} color="#64748b" />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.sellerName}>{so.sellerName}</Text>
                    <Text style={styles.subOrderId}>Sub-Order: #{so.subOrderId}</Text>
                  </View>
                </View>
                <CheckCircle2 size={18} color="#10b981" />
              </View>
            ))}

            {/* Rider Info if assigned */}
            {batch.deliveryBoy && (
              <View style={styles.riderBox}>
                <View style={styles.riderDetails}>
                  <View style={styles.riderAvatar}><Text style={styles.avatarText}>{batch.deliveryBoy.name[0]}</Text></View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.riderName}>{batch.deliveryBoy.name}</Text>
                    <Text style={styles.riderSub}>Delivery Partner</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.callSmall} 
                  onPress={() => Linking.openURL(`tel:${batch.deliveryBoy.phone}`)}
                >
                  <Phone size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {/* Payment & Address */}
        <Text style={styles.sectionTitle}>Delivery & Payment</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MapPin size={20} color="#94a3b8" />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Delivery Address</Text>
              <Text style={styles.infoValue}>{order?.customerDeliveryAddress?.fullName}</Text>
              <Text style={styles.addressSub}>{order?.customerDeliveryAddress?.address}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <CreditCard size={20} color="#94a3b8" />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Payment Method</Text>
              <Text style={styles.infoValue}>{order?.paymentMethod?.toUpperCase()}</Text>
              <Text style={[styles.paymentStatus, { color: order?.paymentStatus === 'paid' ? '#10b981' : '#f59e0b' }]}>
                {order?.paymentStatus?.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Bill Summary */}
        <View style={styles.billCard}>
          <Text style={styles.billTitle}>Bill Summary</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>₹{order?.total}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={styles.billValue}>FREE</Text>
          </View>
          <View style={[styles.billRow, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' }]}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>₹{order?.total}</Text>
          </View>
        </View>

      </ScrollView>

      {/* Track Button (Sticky at bottom) */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.trackFullBtn}
          onPress={() => navigation.navigate('TrackOrder', { orderId: order.masterOrderId })}
        >
          <Text style={styles.trackFullBtnText}>Track Live Order</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  backBtn: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 12 },
  headerTitle: { fontSize: 18, fontWeight: '800', marginLeft: 15, color: '#1e293b' },
  scrollContent: { padding: 20 },
  statusCard: { backgroundColor: '#fff', padding: 20, borderRadius: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  statusInfo: { flex: 1 }, // 🟢 Added this (missing before)
  orderIdText: { fontSize: 16, fontWeight: '900', color: '#1e293b' },
  dateText: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  mainStatusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, // 🟢 Kept only one
  mainStatusText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15, marginLeft: 5 },
  batchContainer: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 15 },
  batchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  batchIdBox: { flexDirection: 'row', alignItems: 'center' },
  batchIdText: { marginLeft: 8, fontWeight: '800', color: '#1e293b' },
  batchStatusText: { fontSize: 12, fontWeight: '700' },
  sellerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sellerInfo: { flexDirection: 'row', alignItems: 'center' },
  sellerName: { fontSize: 14, fontWeight: '700', color: '#475569' },
  subOrderId: { fontSize: 11, color: '#94a3b8' },
  riderBox: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  riderDetails: { flexDirection: 'row', alignItems: 'center' },
    riderName: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  riderAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold' },
  riderSub: { fontSize: 10, color: '#64748b' },
  callSmall: { backgroundColor: '#10b981', padding: 8, borderRadius: 10 },
  infoCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 20 },
  infoRow: { flexDirection: 'row', paddingVertical: 5 },
  infoTextGroup: { marginLeft: 15, flex: 1 },
  infoLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' },
  infoValue: { fontSize: 14, fontWeight: '800', color: '#1e293b', marginTop: 2 },
  addressSub: { fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 18 },
  paymentStatus: { fontSize: 11, fontWeight: '900', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 15 },
  billCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 100 },
  billTitle: { fontSize: 15, fontWeight: '900', color: '#1e293b', marginBottom: 15 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  billLabel: { color: '#64748b', fontSize: 14 },
  billValue: { fontWeight: '700', color: '#1e293b' },
  totalLabel: { fontSize: 16, fontWeight: '900', color: '#1e293b' },
  totalValue: { fontSize: 20, fontWeight: '900', color: '#7c3aed' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  trackFullBtn: { backgroundColor: '#7c3aed', padding: 18, borderRadius: 20, alignItems: 'center', shadowColor: '#7c3aed', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  trackFullBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' }
});
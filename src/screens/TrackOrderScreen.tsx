import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { 
  Truck, MapPin, Clock, ChevronLeft, CheckCircle 
} from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Ye steps aapke backend ke enum se match hone chahiye
const STATUS_STEPS = ['placed', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered'];

export default function TrackOrderScreen({ navigation, route }: any) {
  // 1. Route se orderId lena (Fallback ke liye SN-9928 rakha hai)
  const { orderId } = route.params || { orderId: 'SN-9928' };

  // 2. Real Data Fetching via React Query
  const { data: order, isLoading, isError } = useQuery<any>({
    queryKey: [`/api/orders/${orderId}`],
    refetchInterval: 5000, // Har 5 second mein auto-refresh (Live Tracking ke liye)
  });

  // Loading State
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10, color: '#64748B' }}>Fetching Live Status...</Text>
      </View>
    );
  }

  // Error State
  if (isError || !order) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#EF4444' }}>Order details nahi mil payi!</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text>Wapas Jayein</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Rider & Customer Location (Ab data backend se aayega)
  // Agar backend coordinates nahi bhej raha toh default fallback rakha hai
  const riderLocation = order.riderLocation || { latitude: 25.4455, longitude: 75.6655 };
  const customerLocation = order.customerLocation || { latitude: 25.4490, longitude: 75.6700 };
  const currentStatus = order.status || 'placed';

  return (
    <View style={styles.container}>
      {/* 1. Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#000" size={24} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Track Order</Text>
          <Text style={styles.orderNumber}>#{order.orderNumber || order.id}</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.dot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 2. LIVE MAP SECTION */}
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={{
              ...riderLocation,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker coordinate={riderLocation} title="Rider">
              <View style={styles.riderMarker}>
                <Truck color="white" size={20} />
              </View>
            </Marker>

            <Marker coordinate={customerLocation} title="You">
              <View style={styles.customerMarker}>
                <MapPin color="white" size={20} />
              </View>
            </Marker>
          </MapView>
          
          <View style={styles.etaOverlay}>
            <Clock color="#2563eb" size={18} />
            <Text style={styles.etaText}>
              {order.status === 'delivered' ? 'Order Delivered' : `Arriving in ${order.eta || '--'} Mins`}
            </Text>
          </View>
        </View>

        {/* 3. RIDER INFO CARD (Dynamic) */}
        {order.deliveryPartner ? (
          <View style={styles.card}>
            <View style={styles.riderRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {order.deliveryPartner.name.split(' ').map((n: any) => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.riderDetails}>
                <Text style={styles.riderName}>{order.deliveryPartner.name}</Text>
                <Text style={styles.riderSub}>Professional Delivery Partner</Text>
              </View>
              <TouchableOpacity 
                style={styles.callBtn}
                onPress={() => {/* Linking logic for order.deliveryPartner.phone */}}
              >
                <Feather name="phone" color="white" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.riderRow}>
              <View style={[styles.avatar, { backgroundColor: '#F1F5F9' }]}>
                <Feather name="user" color="#94A3B8" size={20} />
              </View>
              <View style={styles.riderDetails}>
                <Text style={[styles.riderName, { color: '#94A3B8' }]}>Assigning Partner...</Text>
                <Text style={styles.riderSub}>Finding the best route for you</Text>
              </View>
            </View>
          </View>
        )}

        {/* 4. ORDER TIMELINE (Dynamic) */}
        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Order Journey</Text>
          {STATUS_STEPS.map((step, index) => {
            const currentStepIndex = STATUS_STEPS.indexOf(currentStatus);
            const isCompleted = currentStepIndex >= index;
            const isLast = index === STATUS_STEPS.length - 1;

            return (
              <View key={step} style={styles.timelineStep}>
                <View style={styles.indicatorContainer}>
                  <View style={[styles.stepDot, isCompleted && styles.completedDot]}>
                    {isCompleted && <CheckCircle color="white" size={14} />}
                  </View>
                  {!isLast && <View style={[styles.line, isCompleted && styles.completedLine]} />}
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepText, isCompleted && styles.activeStepText]}>
                    {step.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                  {isCompleted && (
                    <Text style={styles.stepTime}>
                      {index === currentStepIndex ? 'Current Status' : 'Completed'}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: '#fff' },
  backBtn: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 12 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  orderNumber: { fontSize: 12, color: '#64748B', fontWeight: 'bold' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E', marginRight: 6 },
  liveText: { fontSize: 10, fontWeight: '900', color: '#166534' },
  mapContainer: { height: 350, width: '100%', marginVertical: 10, position: 'relative' },
  map: { ...StyleSheet.absoluteFillObject },
  riderMarker: { backgroundColor: '#2563eb', padding: 8, borderRadius: 20, borderWidth: 3, borderColor: '#fff' },
  customerMarker: { backgroundColor: '#EF4444', padding: 8, borderRadius: 20, borderWidth: 3, borderColor: '#fff' },
  etaOverlay: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  etaText: { marginLeft: 10, fontSize: 16, fontWeight: '900', color: '#1E293B' },
  card: { backgroundColor: '#fff', margin: 20, borderRadius: 24, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  riderRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: 'bold', color: '#475569' },
  riderDetails: { flex: 1, marginLeft: 15 },
  riderName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  riderSub: { fontSize: 12, color: '#64748B' },
  callBtn: { backgroundColor: '#22C55E', width: 45, height: 45, borderRadius: 22.5, alignItems: 'center', justifyContent: 'center' },
  timelineCard: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 40, borderRadius: 24, padding: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B', marginBottom: 20 },
  timelineStep: { flexDirection: 'row', minHeight: 60 },
  indicatorContainer: { alignItems: 'center', width: 30 },
  stepDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  completedDot: { backgroundColor: '#22C55E' },
  line: { width: 2, flex: 1, backgroundColor: '#E2E8F0', marginVertical: 4 },
  completedLine: { backgroundColor: '#22C55E' },
  stepContent: { flex: 1, marginLeft: 15 },
  stepText: { fontSize: 14, fontWeight: 'bold', color: '#94A3B8' },
  activeStepText: { color: '#1E293B' },
  stepTime: { fontSize: 11, color: '#64748B', marginTop: 2 },
});
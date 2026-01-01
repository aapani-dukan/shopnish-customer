import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Linking } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { io } from 'socket.io-client';
import { Truck, MapPin, Phone, ChevronLeft, Package, Store, Clock, ShieldCheck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../lib/firebase'; // 🟢 Firebase Auth Import

const { width, height } = Dimensions.get('window');
const GOOGLE_MAPS_APIKEY = 'AIzaSyD4G0AfOt0YPc9d0NwAyo1l_t51qra6xxw';

export default function TrackOrderScreen({ route, navigation }: any) {
  const orderId = route?.params?.orderId;
  const [trackingData, setTrackingData] = useState<any>(null);
  const [liveLocations, setLiveLocations] = useState<Map<number, any>>(new Map());
  const [liveETA, setLiveETA] = useState<string | null>(null);
  const socket = useRef<any>(null);

  // 🟢 1. Web Logic: Get Display ETA (Priority: Backend > Map > Fallback)
  const getDisplayETA = () => {
    if (trackingData?.estimatedDeliveryTime) {
      return new Date(trackingData.estimatedDeliveryTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return liveETA || "Arriving Soon";
  };

  const getStatusText = (status: string = "") => {
    const s = status.toLowerCase();
    switch (s) {
      case 'placed': return 'Order Placed';
      case 'confirmed': return 'Confirmed by Store';
      case 'preparing': return 'Items being Prepared';
      case 'ready_for_pickup': return 'Ready for Pickup';
      case 'picked_up': return 'Partner Picked Up';
      case 'out_for_delivery': return 'Rider on the way';
      case 'delivered': return 'Delivered';
      default: return status.replace(/_/g, ' ').toUpperCase();
    }
  };

  const getStatusColor = (status: string = "") => {
    const s = status.toLowerCase();
    if (['placed', 'confirmed', 'accepted'].includes(s)) return '#3b82f6';
    if (['preparing', 'ready_for_pickup'].includes(s)) return '#f59e0b';
    if (['picked_up', 'out_for_delivery', 'in transit'].includes(s)) return '#7c3aed';
    if (['delivered'].includes(s)) return '#10b981';
    return '#64748b';
  };

  // 🟢 2. Fetch Data with Firebase Token (Fixes 401 Error)
  const fetchTracking = async () => {
    try {
      const fbUser = auth.currentUser;
      if (!fbUser) return;
      const token = await fbUser.getIdToken();

      const res = await fetch(`https://shopnish-seprate.onrender.com/api/orders/${orderId}/tracking`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 401) {
        console.error("❌ Auth Failed: Check Backend Token Verification");
        return;
      }

      const data = await res.json();
      setTrackingData(data);
    } catch (e) {
      console.error("Fetch Error:", e);
    }
  };

  // 🟢 3. Socket Connection with Token (Fixes Socket Rejection)
  useEffect(() => {
    const initSocket = async () => {
      const fbUser = auth.currentUser;
      const token = await fbUser?.getIdToken();

      socket.current = io("https://shopnish-seprate.onrender.com", { 
        transports: ['websocket'],
        auth: { token: `Bearer ${token}` }
      });

      socket.current.on('connect', () => {
        socket.current.emit("register-client", { role: "user", userId: fbUser?.uid });
        socket.current.emit("join-order-room", { orderId: Number(orderId) });
      });

      socket.current.on("order:delivery_location", (data: any) => {
        setLiveLocations((prev) => {
          const newMap = new Map(prev);
          newMap.set(data.batchId, { lat: data.lat, lng: data.lng });
          return newMap;
        });
      });

      socket.current.on('order:status_updated', fetchTracking);
    };

    fetchTracking();
    initSocket();

    return () => socket.current?.disconnect();
  }, [orderId]);

  // 🟢 4. Map Logic (Coordinates Parsing)
  const mapNodes = useMemo(() => {
    if (!trackingData || !trackingData.deliveryBatchesSummary?.length) return null;

    const batch = trackingData.deliveryBatchesSummary[0];
    const live = liveLocations.get(batch.batchId);
    const db = batch.deliveryBoy;

    const rLat = parseFloat(String(live?.lat || db?.currentLocation?.lat || 0));
    const rLng = parseFloat(String(live?.lng || db?.currentLocation?.lng || 0));
    
    // Yahan agar 0 aa raha ho toh debugging ke liye manual coords dalkar check kar sakte hain
    const cLat = parseFloat(String(trackingData.customerDeliveryAddress?.latitude || 0));
    const cLng = parseFloat(String(trackingData.customerDeliveryAddress?.longitude || 0));

    const riderPos = { latitude: rLat, longitude: rLng };
    const customerPos = { latitude: cLat, longitude: cLng };

    const bStatus = batch.batchStatus.toLowerCase();
    const isNotPickedUp = ["placed", "confirmed", "accepted", "preparing", "ready_for_pickup"].includes(bStatus);
    
    let destinationPos = customerPos;
    if (isNotPickedUp && batch.storeLocations?.length > 0) {
      destinationPos = {
        latitude: parseFloat(String(batch.storeLocations[0].latitude)),
        longitude: parseFloat(String(batch.storeLocations[0].longitude))
      };
    }

    return { riderPos, destinationPos };
  }, [trackingData, liveLocations]);

  if (!trackingData) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loaderText}>SYNCING LIVE STATUS...</Text>
      </View>
    );
  }

  const currentStatus = trackingData.overallDeliveryStatus || trackingData.status;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.mapWrapper}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: mapNodes?.riderPos?.latitude || trackingData.customerDeliveryAddress?.latitude || 25.44,
            longitude: mapNodes?.riderPos?.longitude || trackingData.customerDeliveryAddress?.longitude || 75.66,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          }}
        >
          {mapNodes && mapNodes.riderPos.latitude !== 0 && mapNodes.destinationPos.latitude !== 0 && (
            <>
              <MapViewDirections
                origin={mapNodes.riderPos}
                destination={mapNodes.destinationPos}
                apikey={GOOGLE_MAPS_APIKEY}
                strokeWidth={4}
                strokeColor="#7c3aed"
                optimizeWaypoints={true}
                mode="DRIVING"
                onReady={result => setLiveETA(`${Math.ceil(result.duration)} mins`)}
                onError={(err) => console.log("Directions Error:", err)}
              />
              <Marker coordinate={mapNodes.riderPos} anchor={{x:0.5, y:0.5}}>
                <View style={[styles.markerBase, {backgroundColor: '#7c3aed'}]}><Truck color="#fff" size={16} /></View>
              </Marker>
              <Marker coordinate={mapNodes.destinationPos}>
                <View style={[styles.markerBase, {backgroundColor: '#ef4444'}]}><MapPin color="#fff" size={16} /></View>
              </Marker>
            </>
          )}
        </MapView>
        
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#1e293b" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.dragHandle} />
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.orderLabel}>ORDER #{trackingData.masterOrderNumber}</Text>
            <Text style={styles.statusMain}>{getStatusText(currentStatus)}</Text>
          </View>
          <View style={[styles.statusBadge, {backgroundColor: getStatusColor(currentStatus) + '20'}]}>
             <Text style={[styles.statusText, {color: getStatusColor(currentStatus)}]}>LIVE UPDATE</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.etaCard}>
             <View style={styles.etaIcon}><Clock color="#fff" size={20}/></View>
             <View>
               <Text style={styles.etaSub}>ESTIMATED ARRIVAL</Text>
               <Text style={styles.etaTime}>{getDisplayETA()}</Text>
             </View>
             <View style={styles.safetyBadge}>
               <ShieldCheck color="#10b981" size={14} />
               <Text style={styles.safetyText}>Contactless</Text>
             </View>
          </View>

          <Text style={styles.sectionTitle}>Shipment Details</Text>
          {trackingData?.deliveryBatchesSummary?.map((batch: any, idx: number) => (
            <View key={idx} style={styles.batchCard}>
              <View style={styles.batchHeader}>
                <Text style={styles.batchId}>Batch #{batch.batchId}</Text>
                <Text style={[styles.batchStatus, {color: getStatusColor(batch.batchStatus)}]}>{getStatusText(batch.batchStatus)}</Text>
              </View>
              {batch?.deliveryBoy && (
                <View style={styles.riderRow}>
                   <View style={styles.riderAvatar}><Package color="#64748b" /></View>
                   <View style={{flex:1, marginLeft: 12}}>
                     <Text style={styles.riderName}>{batch.deliveryBoy.name}</Text>
                     <Text style={styles.riderRating}>★ 4.9 • Delivery Partner</Text>
                   </View>
                   <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${batch.deliveryBoy.phone}`)}>
                     <Phone color="#fff" size={18} />
                   </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loaderText: { marginTop: 20, fontSize: 12, fontWeight: '900', color: '#7c3aed', letterSpacing: 2 },
  mapWrapper: { height: height * 0.42, width: width },
  map: { ...StyleSheet.absoluteFillObject },
  backBtn: { position: 'absolute', top: 50, left: 20, backgroundColor: '#fff', padding: 10, borderRadius: 15, elevation: 5 },
  infoCard: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 35, borderTopRightRadius: 35, marginTop: -35, padding: 25, elevation: 20 },
  dragHandle: { width: 40, height: 4, backgroundColor: '#e2e8f0', alignSelf: 'center', marginBottom: 20, borderRadius: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  orderLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8', letterSpacing: 1 },
  statusMain: { fontSize: 26, fontWeight: '900', color: '#1e293b' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '900' },
  etaCard: { backgroundColor: '#1e293b', borderRadius: 25, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  etaIcon: { width: 45, height: 45, backgroundColor: '#7c3aed', borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  etaSub: { fontSize: 10, color: '#94a3b8', fontWeight: '800' },
  etaTime: { fontSize: 22, fontWeight: '900', color: '#fff' },
  safetyBadge: { marginLeft: 'auto', backgroundColor: '#ffffff10', padding: 8, borderRadius: 12, alignItems: 'center' },
  safetyText: { color: '#10b981', fontSize: 9, fontWeight: '800', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#1e293b', marginBottom: 15 },
  batchCard: { backgroundColor: '#f8fafc', borderRadius: 25, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#f1f5f9' },
  batchHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  batchId: { fontSize: 14, fontWeight: '800', color: '#1e293b' },
  batchStatus: { fontSize: 12, fontWeight: '800' },
  riderRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 18 },
  riderAvatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  riderName: { fontSize: 15, fontWeight: '800', color: '#1e293b' },
  riderRating: { fontSize: 11, color: '#94a3b8' },
  callBtn: { backgroundColor: '#10b981', padding: 12, borderRadius: 15 },
  markerBase: { padding: 8, borderRadius: 20, borderWidth: 3, borderColor: '#fff', elevation: 10 }
});
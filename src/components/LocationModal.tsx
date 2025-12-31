import React, { useEffect, useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  SafeAreaView 
} from 'react-native';
import { MapPin, X, Navigation, Plus, Check } from 'lucide-react-native';
import { useLocation } from '../context/LocationContext';
import api from '../services/api';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationModal({ isOpen, onClose }: LocationModalProps) {
  const { 
    fetchCurrentGeolocation, 
    currentLocation, 
    loadingLocation,
    updateLocationManually 
  } = useLocation();

  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Modal khulne par addresses load karein
  useEffect(() => {
    if (isOpen) {
      loadAddresses();
    }
  }, [isOpen]);

  const loadAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const response = await api.get('/api/addresses/user');
      setSavedAddresses(response.data);
    } catch (err: any) {
      console.error("Addresses fetch error:", err.response?.data || err.message);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      await fetchCurrentGeolocation();
      onClose();
    } catch (err) {
      Alert.alert("Error", "Location fetch nahi ho payi.");
    }
  };

  const selectAddress = async (item: any) => {
    // Backend ke fields ke hisaab se update karein
    await updateLocationManually(
      item.latitude, 
      item.longitude, 
      item.addressLine1, 
      item.pincode
    );
    onClose();
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.fullScreen}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X color="#374151" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>डिलीवरी लोकेशन चुनें</Text>
          <View style={{ width: 40 }} /> 
        </View>

        <View style={styles.content}>
          {/* 1. Current Location Button */}
          <TouchableOpacity 
            style={styles.currentLocationBtn} 
            onPress={handleUseCurrentLocation}
            disabled={loadingLocation}
          >
            <Navigation color="#2563eb" size={20} />
            <Text style={styles.currentLocationText}>
              {loadingLocation ? 'खोज रहा है...' : 'वर्तमान स्थान का उपयोग करें'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 2. Saved Addresses List */}
          <Text style={styles.sectionLabel}>सहेजे गए पते</Text>
          
          {loadingAddresses ? (
            <ActivityIndicator size="small" color="#2563eb" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={savedAddresses}
              keyExtractor={(item: any) => (item._id || item.id || Math.random()).toString()}
              renderItem={({ item }: { item: any }) => (
                <TouchableOpacity 
                  style={[
                    styles.addressCard,
                    currentLocation?.pincode === item.pincode && styles.selectedCard
                  ]}
                  onPress={() => selectAddress(item)}
                >
                  <View style={styles.addressInfo}>
                    <MapPin 
                      color={currentLocation?.pincode === item.pincode ? "#2563eb" : "#6b7280"} 
                      size={20} 
                    />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={styles.addressLabel}>{item.label || 'Saved Address'}</Text>
                      <Text style={styles.addressText} numberOfLines={2}>
                        {item.addressLine1}, {item.city} - {item.pincode}
                      </Text>
                    </View>
                  </View>
                  {currentLocation?.pincode === item.pincode && (
                    <Check color="#2563eb" size={20} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>कोई पता सहेजा नहीं गया है।</Text>
              }
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}

          {/* 3. Add New Address Button */}
          <TouchableOpacity 
            style={styles.addNewBtn}
            onPress={() => Alert.alert("Coming Soon", "Map Picker Screen setup next step mein karenge.")}
          >
            <Plus color="#fff" size={20} />
            <Text style={styles.addNewText}>नया पता जोड़ें</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: '#fff' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f3f4f6',
    alignItems: 'center'
  },
  closeBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
  content: { flex: 1, padding: 16 },
  currentLocationBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 12, 
    backgroundColor: '#eff6ff',
    marginBottom: 20
  },
  currentLocationText: { marginLeft: 10, color: '#2563eb', fontWeight: '700', fontSize: 15 },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginBottom: 20 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 12 },
  addressCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    marginBottom: 12 
  },
  selectedCard: { borderColor: '#2563eb', backgroundColor: '#f0f7ff' },
  addressInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  addressLabel: { fontSize: 15, fontWeight: '700', color: '#1f2937' },
  addressText: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  emptyText: { textAlign: 'center', color: '#9ca3af', marginTop: 20 },
  addNewBtn: { 
    flexDirection: 'row', 
    backgroundColor: '#2563eb', 
    padding: 16, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20
  },
  addNewText: { color: '#fff', fontWeight: '700', marginLeft: 8 }
});
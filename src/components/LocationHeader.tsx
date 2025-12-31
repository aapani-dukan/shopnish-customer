import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MapPin, ChevronDown } from 'lucide-react-native';
import { useLocation } from '../context/LocationContext';
import LocationModal from './LocationModal'; // ✅ Modal import kiya

export default function LocationHeader() {
  const { currentLocation, loadingLocation } = useLocation();
  const [modalVisible, setModalVisible] = useState(false); // ✅ State yahan kaam karegi

  // Address ko chota karne ka logic
  const formatAddress = (addr: string) => {
    return addr.length > 25 ? addr.substring(0, 25) + "..." : addr;
  };

  if (loadingLocation) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#2563eb" />
        <Text style={styles.loadingText}>लोकेशन लोड हो रही है...</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <MapPin color="#2563eb" size={20} />
        <TouchableOpacity 
          style={styles.textContainer} 
          onPress={() => setModalVisible(true)} // ✅ Click par modal khulega
        >
          <Text style={styles.deliverTo}>डिलीवर किया जा रहा है:</Text>
          <View style={styles.addressRow}>
            <Text style={styles.addressText}>
              {currentLocation ? formatAddress(currentLocation.address) : "अपना पता चुनें"}
            </Text>
            <ChevronDown color="#2563eb" size={16} />
          </View>
        </TouchableOpacity>
      </View>

      {/* ✅ Modal ko yahan add kiya */}
      <LocationModal 
        isOpen={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  textContainer: {
    marginLeft: 8,
  },
  deliverTo: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
    marginRight: 4,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 12,
    color: '#666'
  }
});
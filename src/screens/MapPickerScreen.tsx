import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MapPin, ChevronLeft } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function MapPickerScreen({ navigation, route }: any) {
  const [region, setRegion] = useState({
    latitude: 25.4419, // Default: Bundi
    longitude: 75.6597,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const confirmLocation = () => {
    // Pichli screen (AddAddress) ko coordinates wapas bhejna
    route.params.onLocationSelect({
      latitude: region.latitude,
      longitude: region.longitude,
    });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={(reg) => setRegion(reg)}
      />
      
      {/* Center Pin Indicator */}
      <View style={styles.markerFixed} pointerEvents="none">
        <MapPin size={40} color="#2563eb" fill="#bfdbfe" />
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <ChevronLeft color="#0f172a" size={28} />
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.hint}>Move the map to place the pin at your doorstep</Text>
        <TouchableOpacity style={styles.confirmBtn} onPress={confirmLocation}>
          <Text style={styles.confirmText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  markerFixed: { position: 'absolute', top: '50%', left: '50%', marginLeft: -20, marginTop: -40 },
  backBtn: { position: 'absolute', top: 50, left: 20, backgroundColor: '#fff', padding: 10, borderRadius: 15, elevation: 5 },
  footer: { position: 'absolute', bottom: 0, width: width, backgroundColor: '#fff', padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 20 },
  hint: { textAlign: 'center', color: '#64748b', marginBottom: 15, fontWeight: '600' },
  confirmBtn: { backgroundColor: '#2563eb', padding: 18, borderRadius: 15, alignItems: 'center' },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});
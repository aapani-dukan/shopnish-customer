import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Navigation, ChevronLeft, MapPin, Home, Briefcase } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import api from '../services/api'; 

export default function AddAddressScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [addressType, setAddressType] = useState('Home');

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    houseNo: '',      // New
    area: '',         // New (Street/Colony)
    landmark: '',     // New
    city: '',
    state: 'Rajasthan',
    pincode: '',
    latitude: 0,
    longitude: 0,
  });
// Is detectLocation function ko replace karein:

const detectLocation = async () => {
  try {
    setLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return Alert.alert("Permission Error", "GPS access denied.");

    // Accurate coordinates fetch karein
    let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    
    const res = await api.post('/api/addresses/process-current-location', {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude
    });

    if (res.data) {
      // 🛑 LOGIC FIX: Agar addressLine1 aur City dono same hain (jaise 'Bundi'), 
      // toh hum area field ko khali rakhenge taaki user apni colony khud bhare.
      const detectedArea = res.data.addressLine1 === res.data.city ? "" : res.data.addressLine1;

      setFormData({
        ...formData,
        area: detectedArea || '', // Agar sirf Bundi aaya toh khali rahega
        city: res.data.city || 'Bundi',
        pincode: res.data.pincode || '',
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      });

      if (!detectedArea) {
        Alert.alert("Location Found", "Humne City dhoond li hai, kripya apni Colony/Road ka naam manually bharein.");
      } else {
        Alert.alert("Location Detected", "Area and City updated.");
      }
    }
  } catch (error) {
    Alert.alert("Error", "GPS process failed. Please enter manually.");
  } finally {
    setLoading(false);
  }
};
  

  // Is file mein baaki code wahi rahega, handleSave function ko isse update karein:

const handleSave = async () => {
  const { fullName, phoneNumber, houseNo, area, landmark, city, pincode, latitude, longitude } = formData;
  
  if (!fullName || !phoneNumber || !houseNo || !area || !pincode) {
    return Alert.alert("Mandatory Fields", "Please fill Name, Phone, House No, Area and Pincode.");
  }

  try {
    setLoading(true);
    let finalLat = latitude;
    let finalLng = longitude;

    // 🛠️ UNIQUE FIX: Agar latitude 0 hai (manual entry), toh Google se coordinates lo
    if (finalLat === 0) {
      const fullAddr = `${area}, ${city}, ${pincode}`;
      const geoRes = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddr)}&key=AIzaSyD4G0AfOt0YPc9d0NwAyo1l_t51qra6xxw`
      );
      const geoData = await geoRes.json();
      if (geoData.results.length > 0) {
        finalLat = geoData.results[0].geometry.location.lat;
        finalLng = geoData.results[0].geometry.location.lng;
      }
    }

    const fullAddressString = `${houseNo}, ${area}${landmark ? ', Near ' + landmark : ''}`;
    const payload = {
      fullName,
      phoneNumber,
      addressLine1: fullAddressString,
      city,
      state: formData.state,
      pincode,
      latitude: finalLat,
      longitude: finalLng,
      label: addressType,
      isDefault: true
    };

    const response = await api.post('/api/addresses/', payload);
    if (response.status === 201) {
      Alert.alert("Success", "Address saved successfully!");
      navigation.goBack();
    }
  } catch (error: any) {
    Alert.alert("Save Failed", "Please check your connection.");
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft size={28} color="#0f172a" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Address</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.gpsButton} onPress={detectLocation} disabled={loading}>
          <Navigation size={20} color="#2563eb" />
          <Text style={styles.gpsText}>{loading ? "Locating..." : "Use Current Location"}</Text>
        </TouchableOpacity>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput style={styles.input} placeholder="e.g. Rahul Sharma" value={formData.fullName} onChangeText={(v) => setFormData({...formData, fullName: v})} />

          <Text style={styles.label}>Phone Number *</Text>
          <TextInput style={styles.input} keyboardType="phone-pad" placeholder="10-digit mobile number" value={formData.phoneNumber} onChangeText={(v) => setFormData({...formData, phoneNumber: v})} />

          <View style={styles.divider} />

          <Text style={styles.label}>House No / Flat / Floor *</Text>
          <TextInput style={styles.input} placeholder="e.g. 4-G-21 or Flat 402" value={formData.houseNo} onChangeText={(v) => setFormData({...formData, houseNo: v})} />

          <Text style={styles.label}>Apartment / Road / Colony *</Text>
          <TextInput style={styles.input} placeholder="e.g. Vikrant Nagar" value={formData.area} onChangeText={(v) => setFormData({...formData, area: v})} />

          <Text style={styles.label}>Nearby Landmark (Optional)</Text>
          <TextInput style={styles.input} placeholder="e.g. Near Shiv Temple" value={formData.landmark} onChangeText={(v) => setFormData({...formData, landmark: v})} />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>City</Text>
              <TextInput style={styles.input} value={formData.city} onChangeText={(v) => setFormData({...formData, city: v})} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.label}>Pincode *</Text>
              <TextInput style={styles.input} keyboardType="number-pad" value={formData.pincode} onChangeText={(v) => setFormData({...formData, pincode: v})} />
            </View>
          </View>

          <Text style={styles.label}>Save As</Text>
          <View style={styles.typeContainer}>
            {['Home', 'Work', 'Other'].map((type) => (
              <TouchableOpacity key={type} style={[styles.typeBtn, addressType === type && styles.typeBtnActive]} onPress={() => setAddressType(type)}>
                <Text style={[styles.typeBtnText, addressType === type && styles.typeBtnTextActive]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Address</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  scrollContent: { padding: 20 },
  gpsButton: { flexDirection: 'row', padding: 15, backgroundColor: '#eff6ff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#bfdbfe', borderStyle: 'dashed' },
  gpsText: { color: '#2563eb', fontWeight: '700' },
  form: { marginTop: 10 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginTop: 15 },
  input: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', marginTop: 5, fontSize: 15 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 10 },
  row: { flexDirection: 'row' },
  typeContainer: { flexDirection: 'row', gap: 10, marginTop: 10 },
  typeBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', backgroundColor: '#fff' },
  typeBtnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  typeBtnText: { color: '#64748b', fontWeight: '600' },
  typeBtnTextActive: { color: '#fff' },
  saveBtn: { backgroundColor: '#2563eb', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 30, marginBottom: 20 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
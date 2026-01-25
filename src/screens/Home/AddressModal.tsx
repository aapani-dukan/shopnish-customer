import React, { useState } from 'react';
import { View, Text, Modal, Pressable, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
import { Plus, MapPin, CheckCircle2, Home, Briefcase, Navigation } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

interface Address {
  id: string | number;
  label: string;      // e.g., "Home", "Work"
  subLabel?: string;  // e.g., "B-12, Sector 5, Bundi" (यही वो प्रॉपर्टी है जो गायब थी)
  addressLine: string;
  pincode: string;
  isDefault?: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  currentLocation?: {
    pincode?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  savedAddresses?: Address[]; 
}

// इसके नीचे आपका "const AddressModal: React.FC<Props> = ..." वाला कोड शुरू होगा
const { width, height } = Dimensions.get('window');

// ... (Interface remains same)

const AddressModal: React.FC<Props> = ({ visible, onClose, currentLocation, savedAddresses = [] }) => {
  const navigation = useNavigation<any>();
  const [selectedAddressId, setSelectedAddressId] = useState<string | number | 'current'>('current');

  // एड्रेस टाइप के हिसाब से आइकॉन चुनने का लॉजिक
  const getAddressIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('home')) return <Home size={20} color="#2563eb" />;
    if (lowerLabel.includes('work') || lowerLabel.includes('office')) return <Briefcase size={20} color="#2563eb" />;
    return <MapPin size={20} color="#2563eb" />;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.dragHandle} />

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Choose Address</Text>
            <Text style={styles.subtitle}>Where should we deliver?</Text>
          </View>
          <TouchableOpacity
            style={styles.addNewBtn}
            onPress={() => { onClose(); navigation.navigate('Addresses'); }}
          >
            <Plus size={16} color="#fff" strokeWidth={3} />
            <Text style={styles.addNewText}>Add New</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Current Location Section */}
          <TouchableOpacity
            style={[styles.addressItem, selectedAddressId === 'current' && styles.selectedItem]}
            onPress={() => { setSelectedAddressId('current'); onClose(); }}
          >
            <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
              <Navigation size={22} color="#2563eb" fill="#bfdbfe" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.addressLabel}>Current Location</Text>
              <View style={styles.pincodeTag}>
                 <Text style={styles.pincodeText}>
                    {currentLocation?.pincode ? `PIN: ${currentLocation.pincode}` : 'Using GPS'}
                 </Text>
              </View>
            </View>
            {selectedAddressId === 'current' && <CheckCircle2 size={24} color="#2563eb" fill="#fff" />}
          </TouchableOpacity>

          <Text style={styles.sectionDivider}>SAVED ADDRESSES</Text>

          {savedAddresses.map((addr) => (
            <TouchableOpacity
              key={addr.id}
              style={[styles.addressItem, selectedAddressId === addr.id && styles.selectedItem]}
              onPress={() => { setSelectedAddressId(addr.id); onClose(); }}
            >
              <View style={styles.iconBox}>
                {getAddressIcon(addr.label)}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressLabel}>{addr.label}</Text>
                {addr.subLabel && <Text style={styles.addressSub} numberOfLines={1}>{addr.subLabel}</Text>}
              </View>
              {selectedAddressId === addr.id && <CheckCircle2 size={24} color="#2563eb" fill="#fff" />}
            </TouchableOpacity>
          ))}

          {savedAddresses.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No saved addresses found.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default AddressModal;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    height: height * 0.6,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 24,
    position: 'absolute',
    bottom: 0,
    width: width,
    ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20 },
        android: { elevation: 30 }
    })
  },
  dragHandle: { width: 45, height: 6, backgroundColor: '#f1f5f9', alignSelf: 'center', marginBottom: 20, borderRadius: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 },
  title: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  addNewBtn: { 
    flexDirection: 'row', alignItems: 'center', gap: 6, 
    backgroundColor: '#2563eb', paddingHorizontal: 16, 
    paddingVertical: 10, borderRadius: 14,
    elevation: 4
  },
  addNewText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  scrollContent: { paddingBottom: 40 },
  addressItem: {
    flexDirection: 'row', alignItems: 'center', padding: 18,
    backgroundColor: '#fff', borderRadius: 24, marginBottom: 12,
    borderWidth: 1.5, borderColor: '#f1f5f9'
  },
  selectedItem: { borderColor: '#2563eb', backgroundColor: '#f0f7ff' },
  iconBox: { 
    width: 52, height: 52, borderRadius: 18, 
    backgroundColor: '#f8fafc', justifyContent: 'center', 
    alignItems: 'center', marginRight: 16 
  },
  addressLabel: { fontSize: 17, fontWeight: '800', color: '#1e293b' },
  addressSub: { fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 18 },
  pincodeTag: {
    alignSelf: 'flex-start', backgroundColor: '#f1f5f9',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 6
  },
  pincodeText: { fontSize: 11, fontWeight: 'bold', color: '#475569' },
  sectionDivider: { 
    fontSize: 12, fontWeight: '900', color: '#94a3b8', 
    letterSpacing: 1.5, marginTop: 20, marginBottom: 15 
  },
  emptyContainer: { paddingVertical: 30, alignItems: 'center' },
  emptyText: { color: '#94a3b8', fontSize: 14, fontStyle: 'italic' },
});
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';

export default function OrderSuccessScreen({ navigation }: any) {
  const route = useRoute<any>();
  // 🎯 फिक्स 1: चेकआउट स्क्रीन से पास की गई 'orderId' को सेफ़ली रिसीव किया भाई
  const orderId = route.params?.orderId;

  return (
    <View style={styles.container}>
      <View style={styles.successCircle}>
        <Feather name="check" size={60} color="white" />
      </View>
      <Text style={styles.title}>Order Placed!</Text>
      <Text style={styles.message}>Bhai, aapka order successfully register ho gaya hai.</Text>
      
      {/* 🎯 फिक्स 2: लाइव ट्रैकिंग के लिए नया 'Track Order' बटन जोड़ा भाई ताकि कस्टमर सीधे सब-ऑर्डर्स देख सके */}
      {orderId && (
        <TouchableOpacity 
          style={styles.trackBtn} 
          onPress={() => navigation.replace('OrderDetails', { orderId: orderId })}
        >
          <Feather name="map-pin" size={18} color="#2563eb" style={{ marginRight: 8 }} />
          <Text style={styles.trackBtnText}>Track Live Order</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity 
        style={styles.btn} 
        onPress={() => navigation.navigate('Main')}
      >
        <Text style={styles.btnText}>Back to Shopping</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 20 },
  successCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 10 },
  message: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 30 },
  // 🎯 ट्रैक बटन की शानदार प्रीमियम स्टाइल्स भाई
  trackBtn: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff', 
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    paddingVertical: 14, 
    width: '85%',
    borderRadius: 14,
    marginBottom: 12
  },
  trackBtnText: { color: '#2563eb', fontSize: 16, fontWeight: '800' },
  btn: { 
    backgroundColor: '#2563eb', 
    paddingVertical: 15, 
    width: '85%',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function OrderSuccessScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.successCircle}>
        <Feather name="check" size={60} color="white" />
      </View>
      <Text style={styles.title}>Order Placed!</Text>
      <Text style={styles.message}>Bhai, aapka order successfully register ho gaya hai.</Text>
      
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
  btn: { backgroundColor: '#2563eb', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 12 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
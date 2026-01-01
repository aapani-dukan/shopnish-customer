import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, TouchableOpacity, 
  TextInput, ActivityIndicator, Alert, Dimensions, Image 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLocation } from '../context/LocationContext';
import api from '../services/api';
import { MapPin, CreditCard, ChevronLeft, CheckCircle2, Zap } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function CheckoutDirectScreen() {
  const navigation = useNavigation<any>();
  const { currentLocation } = useLocation();
    const route = useRoute<any>();
    const directItem = route.params?.item; // Direct buy item
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Review, 2: Address, 3: Payment

  // ✅ Form States: Initial values currentLocation se le rahe hain
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState(currentLocation?.address || '');
  const [city, setCity] = useState(currentLocation?.city || 'Bundi');
  const [pincode, setPincode] = useState(currentLocation?.pincode || '');
  const [landmark, setLandmark] = useState('');
  const [instructions, setDeliveryInstructions] = useState('');


  const subtotal = directItem.price * directItem.quantity;
  const deliveryCharge = subtotal >= 500 ? 0 : 25;
  const total = subtotal + deliveryCharge;

  const handlePlaceOrder = async () => {
    if (!fullName || !phone || !address) {
      Alert.alert("Error","Please add your delivery address and phone number to proceed with your order.", );
      return;
    }

    try {
      setLoading(true);

      // ✅ Exact Payload as per your checkout2.tsx
      const orderData = {
        newDeliveryAddress: {
          fullName,
          phoneNumber: phone,
          address,
          city: "Bundi",
          state: "Rajasthan",
          pincode: "323001",
          latitude: Number(currentLocation?.latitude || 0),
          longitude: Number(currentLocation?.longitude || 0),
        },
        paymentMethod: "cod",
        deliveryInstructions: instructions,
        item: {
          productId: directItem.id || directItem._id,
          sellerId: directItem.sellerId,
          quantity: directItem.quantity,
          unitPrice: Number(directItem.price),
          priceAtAdded: Number(directItem.price),
          totalPrice: Number(directItem.price) * directItem.quantity,
        },
        subtotal: Number(subtotal),
        deliveryCharge: Number(deliveryCharge),
        total: Number(total),
        sellerId: directItem.sellerId,
        cartOrder: false, // Kyunki ye direct buy hai
      };

      console.log("SENDING BUY NOW PAYLOAD:", orderData);
      const response = await api.post('/api/orders/buy-now', orderData);

      if (response.status === 200 || response.status === 201) {
        Alert.alert("Order Confirmed! 🚀", "Aapka order successfully place ho gaya hai.", [
          { text: "Success!", onPress: () =>
             // ✅ Best way: Reset stack and go to Home (which is inside 'Main')
navigation.reset({
  index: 0,
  routes: [
    { 
      name: 'Main', 
      params: { screen: 'Home' } 
    }
  ],
})
             }
        ]);
      }
    } catch (error: any) {
      console.error("Buy Now Error:", error.response?.data || error.message);
      Alert.alert("Opps!", error.response?.data?.message || "Order nahi ho paya.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#000" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
            <Zap size={18} color="#f59e0b" fill="#f59e0b" />
            <Text style={styles.headerTitle}>Quick Checkout</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Step 1: Review Item */}
        <View style={styles.card}>
            <View style={styles.itemRow}>
                <Image source={{ uri: directItem.image }} style={styles.itemImg} />
                <View style={{flex: 1, marginLeft: 15}}>
                    <Text style={styles.itemName}>{directItem.name}</Text>
                    <Text style={styles.itemSub}>Qty: {directItem.quantity} • Price: ₹{directItem.price}</Text>
                </View>
                <Text style={styles.itemTotal}>₹{subtotal}</Text>
            </View>
        </View>

        {/* Delivery Form */}
        <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} placeholderTextColor="#94a3b8" />
            <TextInput style={styles.input} placeholder="Mobile Number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} placeholderTextColor="#94a3b8" />
            <TextInput style={[styles.input, {height: 100}]} placeholder="Complete Address (Flat, Street, Area)" multiline value={address} onChangeText={setAddress} placeholderTextColor="#94a3b8" />
            <TextInput style={styles.input} placeholder="Any special instructions?" value={instructions} onChangeText={setDeliveryInstructions} placeholderTextColor="#94a3b8" />
        </View>

        {/* Payment & Summary */}
        <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.priceRow}><Text style={styles.priceLabel}>Item Total</Text><Text style={styles.priceValue}>₹{subtotal}</Text></View>
            <View style={styles.priceRow}><Text style={styles.priceLabel}>Delivery Fee</Text><Text style={[styles.priceValue, {color: '#10b981'}]}>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</Text></View>
            <View style={styles.divider} />
            <View style={styles.priceRow}><Text style={styles.grandLabel}>Total to Pay</Text><Text style={styles.grandValue}>₹{total}</Text></View>
            
            <View style={styles.codBadge}>
                <CheckCircle2 color="#2563eb" size={18} />
                <Text style={styles.codText}>Cash on Delivery Selected</Text>
            </View>
        </View>

      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.orderBtn} 
            onPress={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
                <Text style={styles.orderBtnText}>Place Order • ₹{total}</Text>
            )}
          </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#fff' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  card: { backgroundColor: '#fff', padding: 15, margin: 20, borderRadius: 20, elevation: 2 },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  itemImg: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#f1f5f9' },
  itemName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  itemSub: { fontSize: 13, color: '#64748b', marginTop: 3 },
  itemTotal: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  formContainer: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 15 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0', color: '#0f172a' },
  summaryCard: { backgroundColor: '#fff', padding: 20, margin: 20, borderRadius: 24, elevation: 2 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  priceLabel: { color: '#64748b', fontSize: 14 },
  priceValue: { fontWeight: '700', color: '#1e293b' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 15 },
  grandLabel: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  grandValue: { fontSize: 18, fontWeight: '900', color: '#2563eb' },
  codBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#eff6ff', padding: 10, borderRadius: 12, marginTop: 15 },
  codText: { color: '#2563eb', fontWeight: '700', fontSize: 13 },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  orderBtn: { backgroundColor: '#0f172a', padding: 20, borderRadius: 20, alignItems: 'center' },
  orderBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
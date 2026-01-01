import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, TouchableOpacity, 
  TextInput, ActivityIndicator, Alert, Dimensions 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import api from '../services/api';
import { CreditCard, ChevronLeft, CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export default function CheckoutScreen() {
  const navigation = useNavigation<any>();
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { currentLocation } = useLocation();

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Review, 2: Address, 3: Payment

  // ✅ Form States (Direct Buy screen ki tarah simplified)
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState(currentLocation?.address || '');
  const [city, setCity] = useState('Bundi');
  const [pincode, setPincode] = useState('323001'); // Default as per your direct buy logic
  const [landmark, setLandmark] = useState('');
  const [instructions, setInstructions] = useState('');

  const subtotal = getCartTotal();
  const deliveryCharge = subtotal >= 500 ? 0 : 25;
  const total = subtotal + deliveryCharge;

  // ✅ Step-by-Step validation logic
  const handlePlaceOrder = async () => {
    // Basic check as per your working direct buy screen
    if (!fullName || !phone || !address) {
      Alert.alert("Error", "Please add your delivery address and phone number to proceed.");
      return;
    }

    try {
      setLoading(true);

      // ✅ Mapping items as per Backend requirement
      const itemsToOrder = cart.map(item => ({
        productId: item.productId,
        sellerId: item.product?.sellerId,
        quantity: item.quantity,
        unitPrice: Number(item.product?.price || 0),
        priceAtAdded: Number(item.product?.price || 0),
        totalPrice: Number(item.product?.price || 0) * item.quantity,
      }));

      // ✅ Final Payload: Syncing with Direct Buy logic
      const orderData = {
        customerId: user?.id,
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
        deliveryInstructions: instructions || "",
        subtotal: Number(subtotal), 
        total: Number(total),       
        deliveryCharge: Number(deliveryCharge), 
        items: itemsToOrder,
        cartOrder: true,
      };

      console.log("SENDING CART ORDER PAYLOAD:", orderData);

      const response = await api.post('/api/orders', orderData);

      if (response.status === 200 || response.status === 201) {
        clearCart();
        Alert.alert("Order Confirmed! 🚀", "Aapka order successfully place ho gaya hai.", [
          { 
            text: "Great!", 
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'Main', params: { screen: 'Home' } }],
            }) 
          }
        ]);
      }
    } catch (error: any) {
      console.error("Cart Order Error:", error.response?.data || error.message);
      Alert.alert("Opps!", error.response?.data?.message || "Order nahi ho paya.");
    } finally {
      setLoading(false);
    }
  };

  // UI Components (Same as before)
  const StepIndicator = () => (
    <View style={styles.stepContainer}>
      {[1, 2, 3].map((step) => (
        <View key={step} style={styles.stepWrapper}>
          <View style={[styles.stepCircle, currentStep >= step && styles.activeStep]}>
            {currentStep > step ? <CheckCircle2 size={16} color="#fff" /> : <Text style={[styles.stepText, currentStep >= step && {color: '#fff'}]}>{step}</Text>}
          </View>
          {step < 3 && <View style={[styles.stepLine, currentStep > step && styles.activeLine]} />}
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#000" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <StepIndicator />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        {currentStep === 1 && (
          <View>
            <Text style={styles.sectionTitle}>Review Order</Text>
            {cart.map((item) => (
              <View key={item.productId} style={styles.itemRow}>
                <Text style={styles.itemInfo}>{(item.product?.name || 'Product')} x {item.quantity}</Text>
                <Text style={styles.itemPrice}>₹{Number(item.product?.price || 0) * item.quantity}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setCurrentStep(2)}>
              <Text style={styles.btnText}>Proceed to Address</Text>
            </TouchableOpacity>
          </View>
        )}

        {currentStep === 2 && (
          <View>
            <Text style={styles.sectionTitle}>Delivery Details</Text>
            <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
            <TextInput style={styles.input} placeholder="Phone Number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            <TextInput style={[styles.input, {height: 80}]} placeholder="Complete Address" multiline value={address} onChangeText={setAddress} />
            <TextInput style={styles.input} placeholder="Nearby Landmark" value={landmark} onChangeText={setLandmark} />
            
            <View style={styles.row}>
                <TouchableOpacity style={styles.outlineBtn} onPress={() => setCurrentStep(1)}>
                    <Text style={styles.outlineText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.primaryBtn, {flex: 2}]} onPress={() => setCurrentStep(3)}>
                    <Text style={styles.btnText}>Continue</Text>
                </TouchableOpacity>
            </View>
          </View>
        )}

        {currentStep === 3 && (
          <View>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.paymentCard}>
                <Text style={styles.payName}>Cash on Delivery</Text>
                <CheckCircle2 color="#2563eb" size={24} />
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.totalRow}><Text>Subtotal</Text><Text>₹{subtotal}</Text></View>
              <View style={styles.totalRow}><Text>Delivery</Text><Text style={{color: '#10b981'}}>FREE</Text></View>
              <View style={styles.divider} />
              <View style={styles.totalRow}><Text style={styles.grandTotal}>Total</Text><Text style={styles.grandTotal}>₹{total}</Text></View>
            </View>

            <TouchableOpacity style={styles.placeOrderBtn} onPress={handlePlaceOrder} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Confirm Order • ₹{total}</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ... styles remain same ...
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '900' },
    stepContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10 },
    stepWrapper: { flexDirection: 'row', alignItems: 'center' },
    stepCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
    activeStep: { backgroundColor: '#2563eb' },
    stepText: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
    stepLine: { width: 40, height: 2, backgroundColor: '#e2e8f0', marginHorizontal: 5 },
    activeLine: { backgroundColor: '#2563eb' },
    sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    itemInfo: { fontSize: 15, color: '#475569' },
    itemPrice: { fontSize: 15, fontWeight: '700' },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 15 },
    input: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0' },
    primaryBtn: { backgroundColor: '#2563eb', padding: 18, borderRadius: 15, alignItems: 'center' },
    placeOrderBtn: { backgroundColor: '#0f172a', padding: 20, borderRadius: 18, alignItems: 'center', marginTop: 20 },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    outlineBtn: { flex: 1, padding: 18, borderRadius: 15, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
    outlineText: { fontWeight: 'bold', color: '#64748b' },
    paymentCard: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#eff6ff', borderRadius: 20, borderWidth: 1, borderColor: '#2563eb' },
    payName: { fontSize: 16, fontWeight: 'bold', color: '#2563eb' },
    summaryCard: { backgroundColor: '#f8fafc', padding: 20, borderRadius: 20, marginTop: 20 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    grandTotal: { fontSize: 18, fontWeight: '900' }
});
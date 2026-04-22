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
import { useQuery } from '@tanstack/react-query';
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

 // CheckoutScreen.tsx के अंदर

// 1. एडमिन सेटिंग्स मंगवाएं (जैसे आपने होम स्क्रीन पर डेटा मंगवाया था)
const { data: adminSettings } = useQuery({
  queryKey: ['adminSettings'],
  queryFn: async () => (await api.get('/api/admin/public-settings')).data, // पब्लिक API बनाएं
});

const subtotal = getCartTotal();

// 2. एडमिन की वैल्यू का इस्तेमाल करें, अगर डेटा न मिले तो 'Fallback' वैल्यू (500) रखें
const freeLimit = adminSettings?.freeDeliveryMinOrderValue ?? 500;
const baseCharge = adminSettings?.baseDeliveryCharge ?? 25;

const deliveryCharge = subtotal >= freeLimit ? 0 : baseCharge;
const total = subtotal + deliveryCharge;

  // ✅ Step-by-Step validation logic
  const handlePlaceOrder = async () => {
  if (!fullName || !phone || !address) {
    Alert.alert("अधूरा पता", "कृपया अपना नाम, नंबर और पूरा पता दर्ज करें।");
    return;
  }

  try {
    setLoading(true);

    // ✅ Multi-Seller Structure: हर आइटम के साथ उसका sellerId भेजना ज़रूरी है
    const itemsToOrder = cart.map(item => ({
      productId: item.productId,
      sellerId: item.product?.sellerId, // 👈 पक्का करें कि ये डेटा आपके कार्ट में आ रहा है
      quantity: item.quantity,
      unitPrice: Number(item.product?.price || 0),
      totalPrice: Number(item.product?.price || 0) * item.quantity,
    }));

    const orderData = {
      customerId: user?.id,
     newDeliveryAddress: JSON.stringify({
        fullName,
        phoneNumber: phone, 
        address,
        city: city, // Hardcode के बजाय State variable इस्तेमाल करें
        pincode: pincode,
        latitude: currentLocation?.latitude,
        longitude: currentLocation?.longitude,
      }),
      paymentMethod: "cod",
      deliveryInstructions: instructions,
      // 💸 Amounts को हमेशा Number() में कन्वर्ट करके भेजें (Backend Safety)
      subtotal: Number(subtotal),
      deliveryCharge: Number(deliveryCharge),
      total: Number(total),
      items: itemsToOrder,
      orderSource: "app", // ट्रैक करने के लिए कि ऑर्डर कहाँ से आया
    };

    const response = await api.post('/api/orders', orderData);

    if (response.status === 201 || response.status === 200) {
      clearCart();
      // ✅ OrderSuccessScreen पर नेविगेट करें (अगर बनी हुई है)
      navigation.replace('OrderSuccess', { orderId: response.data.id });
    }
  } catch (error: any) {
    Alert.alert("ओह!", error.response?.data?.message || "ऑर्डर प्लेस करने में समस्या आई।");
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
  {/* Step 1: Review Order */}
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

  {/* Step 2: Delivery Details */}
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

  {/* Step 3: Payment Summary (बैनर को इसके अंदर होना चाहिए) */}
  {currentStep === 3 && (
    <View>
      {/* ✅ FIX 1: बैनर को सही जगह और <Text> के अंदर सुरक्षित किया */}
      {subtotal < freeLimit && (
        <View style={styles.freeDeliveryBanner}>
          <Text style={styles.freeDeliveryText}>
            सिर्फ ₹{freeLimit - subtotal} का सामान और जोड़ें और {'\n'}
            <Text style={{fontWeight: '900'}}>FREE DELIVERY</Text> पाएँ! 🚚
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Payment Summary</Text>
      <View style={styles.paymentCard}>
          <Text style={styles.payName}>Cash on Delivery</Text>
          <CheckCircle2 color="#2563eb" size={24} />
      </View>

      <View style={styles.summaryCard}>
        {/* ✅ FIX 2: इन लाइनों के टेक्स्ट को <Text> टैग के अंदर किया */}
        <View style={styles.totalRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>₹{subtotal}</Text>
        </View>
        
        <View style={styles.totalRow}>
          <Text style={styles.summaryLabel}>Delivery Charge</Text>
          <Text style={[styles.summaryValue, deliveryCharge === 0 && { color: '#10b981' }]}>
            {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
          </Text>
        </View>

        <View style={styles.divider} />
        
        <View style={styles.totalRow}>
          <Text style={styles.grandTotal}>Total</Text>
          <Text style={styles.grandTotal}>₹{total}</Text>
        </View>
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
    grandTotal: { fontSize: 18, fontWeight: '900' },
    // styles के अंदर सबसे नीचे ये जोड़ें:
  freeDeliveryBanner: {
    backgroundColor: '#f0fdf4', // हल्का हरा (Success Green)
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 20,
    alignItems: 'center',
  },
  freeDeliveryText: {
    color: '#166534',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  upsellContainer: {
    backgroundColor: '#fff7ed', // हल्का ऑरेंज
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#fb923c',
  },
  upsellText: {
    color: '#9a3412',
    fontSize: 13,
    fontWeight: '600',
  },
  // styles के अंदर इन्हें भी जोड़ दें:
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
});
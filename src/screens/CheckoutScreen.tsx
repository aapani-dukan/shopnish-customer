import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, TouchableOpacity, 
  TextInput, ActivityIndicator, Alert, Dimensions 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import api from '../services/api';
import { MapPin, CreditCard, ChevronLeft, CheckCircle2, Truck } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
const { width } = Dimensions.get('window');

export default function CheckoutScreen() {
  const navigation = useNavigation<any>();
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  // ✅ Context se sirf currentLocation nikal rahe hain
  const { currentLocation } = useLocation();

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Review, 2: Address, 3: Payment

  // ✅ Form States: Initial values currentLocation se le rahe hain
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState(currentLocation?.address || '');
  const [city, setCity] = useState(currentLocation?.city || 'Bundi');
  const [pincode, setPincode] = useState(currentLocation?.pincode || '');
  const [landmark, setLandmark] = useState('');
  const [instructions, setInstructions] = useState('');

  // ✅ Total Calculations
  const subtotal = getCartTotal();
  const deliveryCharge = subtotal >= 500 ? 0 : 25;
  const total = subtotal + deliveryCharge;

  // ✅ Auto-fill address agar location baad mein fetch hoti hai
  useEffect(() => {
    if (currentLocation) {
      if (!address) setAddress(currentLocation.address);
      if (!city) setCity(currentLocation.city || 'Bundi');
      if (!pincode) setPincode(currentLocation.pincode);
    }
  }, [currentLocation]);

  const handlePlaceOrder = async () => {
  if (!user?.id) {
    Alert.alert("Authentication Error", "You must be logged in to place an order.");
    return;
  }

  // Basic Validation (Web App style)
  if (!fullName || !phone || !address || !pincode || !city || !currentLocation?.latitude) {
    Alert.alert("Address Required", "Please fill in all delivery address fields and select a location.");
    return;
  }

  if (!cart || cart.length === 0) {
    Alert.alert("No Items", "There are no items to place an order.");
    return;
  }

  try {
    setLoading(true);

    // --- 1. Items Mapping (EXACT Web App Logic) ---
    // CheckoutScreen.tsx mein items mapping fix:
const itemsToOrder = cart.map(item => ({
  productId: item.productId, // ya item.product.id
  sellerId: item.product.sellerId,
  quantity: item.quantity,
  unitPrice: Number(item.product.price),
  priceAtAdded: Number(item.product.price),
  totalPrice: Number(item.product.price) * item.quantity,
}));

    // --- 2. Calculation (EXACT Web App Style) ---
    // Web app me 'subtotal' aur 'total' state se aa rahe hain, 
    // hum yahan unhe recalculate karenge taaki mistake na ho
    const calculatedSubtotal = itemsToOrder.reduce((sum, item) => sum + item.totalPrice, 0);
    const calculatedDeliveryCharge = Number(deliveryCharge || 0);
    const calculatedTotal = calculatedSubtotal + calculatedDeliveryCharge;

    const orderData = {
      customerId: user.id, // Backend DB ID
      userPhoneNumberForUpdate: phone.trim(),
      
      newDeliveryAddress: { 
        fullName: fullName.trim(),
        phoneNumber: phone.trim(), 
        address: address.trim(),
        city: city.trim(),
        state: "Rajasthan", 
        pincode: pincode.trim(),
        latitude: Number(currentLocation.latitude),
        longitude: Number(currentLocation.longitude),
      },

      paymentMethod: "cod",
      deliveryInstructions: instructions || "",

      // ✅ Sab values Number format me honi chahiye
      subtotal: calculatedSubtotal, 
      total: calculatedTotal,       
      deliveryCharge: calculatedDeliveryCharge, 

      items: itemsToOrder,
      cartOrder: true,
    };

    console.log("🚀 FINAL SYNCED PAYLOAD:", JSON.stringify(orderData, null, 2));

    const response = await api.post('/api/orders', orderData);

    if (response.status === 200 || response.status === 201) {
      clearCart();
      Alert.alert("Success! 🎉", "Aapka order confirm ho gaya hai.");
      navigation.navigate('Home'); 
    }

  } catch (error: any) {
    console.error("❌ ORDER ERROR:", error.response?.data || error.message);
    const serverMsg = error.response?.data?.message || "Order placement failed.";
    Alert.alert("Order Failed", serverMsg);
  } finally {
    setLoading(false);
  }
};

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
      {/* Header */}
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
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {cart.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemInfo}>
          {(item.product?.name || 'Product')} x {item.quantity}
        </Text>
                <Text style={styles.itemPrice}>₹{Number(item.product?.price || 0) * item.quantity}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setCurrentStep(2)}>
              <Text style={styles.btnText}>Set Delivery Address</Text>
            </TouchableOpacity>
          </View>
        )}

        {currentStep === 2 && (
          <View>
            <Text style={styles.sectionTitle}>Delivery Details</Text>
            <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
            <TextInput style={styles.input} placeholder="Phone Number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            <TextInput style={[styles.input, {height: 80}]} placeholder="Complete Address" multiline value={address} onChangeText={setAddress} />
            <TextInput style={styles.input} placeholder="Landmark (Optional)" value={landmark} onChangeText={setLandmark} />
            <TextInput style={styles.input} placeholder="Instructions for Delivery" value={instructions} onChangeText={setInstructions} />
            
            <View style={styles.row}>
                <TouchableOpacity style={styles.outlineBtn} onPress={() => setCurrentStep(1)}>
                    <Text style={styles.outlineText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.primaryBtn, {flex: 2}]} onPress={() => setCurrentStep(3)}>
                    <Text style={styles.btnText}>Payment Method</Text>
                </TouchableOpacity>
            </View>
          </View>
        )}

        {currentStep === 3 && (
          <View>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentCard}>
              <View style={styles.row}>
                <CreditCard color="#2563eb" size={24} />
                <View style={{marginLeft: 15}}>
                    <Text style={styles.payName}>Cash on Delivery</Text>
                    <Text style={styles.paySub}>Pay when you receive your order</Text>
                </View>
              </View>
              <CheckCircle2 color="#2563eb" size={24} />
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.totalRow}><Text>Subtotal</Text><Text>₹{subtotal}</Text></View>
              <View style={styles.totalRow}><Text>Delivery</Text><Text style={{color: '#10b981'}}>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</Text></View>
              <View style={styles.divider} />
              <View style={styles.totalRow}><Text style={styles.grandTotal}>Grand Total</Text><Text style={styles.grandTotal}>₹{total}</Text></View>
            </View>

            <TouchableOpacity style={styles.placeOrderBtn} onPress={handlePlaceOrder} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Confirm Order (₹{total})</Text>}
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900' },
  stepContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10 },
  stepWrapper: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
  activeStep: { backgroundColor: '#2563eb' },
  stepText: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
  stepLine: { width: 50, height: 2, backgroundColor: '#e2e8f0', marginHorizontal: 5 },
  activeLine: { backgroundColor: '#2563eb' },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20, marginTop: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  itemInfo: { fontSize: 15, color: '#475569' },
  itemPrice: { fontSize: 15, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 15 },
  input: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  primaryBtn: { backgroundColor: '#2563eb', padding: 18, borderRadius: 15, alignItems: 'center' },
  placeOrderBtn: { backgroundColor: '#0f172a', padding: 20, borderRadius: 18, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  outlineBtn: { flex: 1, padding: 18, borderRadius: 15, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  outlineText: { fontWeight: 'bold', color: '#64748b' },
  paymentCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#f0f7ff', borderRadius: 20, borderWidth: 1, borderColor: '#2563eb' },
  payName: { fontSize: 16, fontWeight: 'bold' },
  paySub: { fontSize: 12, color: '#64748b' },
  summaryCard: { backgroundColor: '#f8fafc', padding: 20, borderRadius: 20, marginTop: 30 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  grandTotal: { fontSize: 18, fontWeight: '900', color: '#0f172a' }
});
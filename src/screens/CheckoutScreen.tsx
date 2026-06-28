import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, TouchableOpacity, 
  TextInput, ActivityIndicator, Alert, Dimensions
} from 'react-native';
import { useNavigation,useRoute } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import api from '../services/api';
import { CreditCard, ChevronLeft, CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
export default function CheckoutScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const passedCartItems = route.params?.passedCartItems || [];

const subtotal = Number(route.params?.subtotal || 0);
const deliveryCharge = Number(route.params?.deliveryCharge || 0);
const platformFee = Number(route.params?.platformFee || 0);
const passedTotalAmount = Number(route.params?.totalAmount || 0);

const discount = Number(route.params?.discount || 0);
const extraDiscount = Number(route.params?.extraDiscount || 0);
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
const remainingForFreeDelivery = Number(
  route.params?.remainingForFreeDelivery || 0
);
// 1. एडमिन सेटिंग्स मंगवाएं
  const { data: adminSettings } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: async () => (await api.get('/api/admin/public-settings')).data,
  });

  // ✅ कड़क सुधार: पहले वेरिएबल्स डिक्लेअर किए ताकि नीचे 'subtotal' एरर न मारे भाई साहब!
  const total =
  subtotal +
  deliveryCharge +
  platformFee -
  discount -
  extraDiscount;
     // ==================== 🎯 TYPESCRIPT ERROR-FREE CART ENGINE FIX ====================
  const handlePlaceOrder = async () => {
    if (!fullName || !phone || !address) {
      Alert.alert("अधूरा पता", "कृपया अपना नाम, नंबर और पूरा पता दर्ज करें।");
      return;
    }
    try {
      setLoading(true);

      // 🌟 कड़क सुधार 1: अगर कार्ट स्क्रीन से लाइव डेटा आया है तो उसी 'passedCartItems' पर लूप चलाओ भाई, लोकल 'cart' पर नहीं!
      const finalCartList = passedCartItems && passedCartItems.length > 0 ? passedCartItems : cart;

      const itemsToOrder = finalCartList.map((item: any) => {
        
        // 1. सही लाइव प्राइस निकालने का बुलेटप्रूफ फॉलबैक इंजन (डेटाबेस कॉलम को प्राथमिकता)
        const currentUnitPrice = Number(
          item.priceAtAdded || 
          item.price_at_added || 
          item.variant?.price || 
          item.price || 
          item.product?.price || 
          item.unitPrice ||
          0
        );
        
        // 2. वैरिएंट आईडी को पूरी सुरक्षा के साथ निकालना
        const finalVariantId = item.variantId || item.variant?.id || item.id || null;

        // 3. डेटाबेस के variant_name कॉलम के लिए सुंदर साइज स्ट्रिंग बनाना
        const sizeString = item.variant?.quantityValue 
          ? `${item.variant.quantityValue} ${item.variant.unit || 'g'}`.trim() 
          : (item.variantName || '');

        return {
          productId: item.productId || item.product?.id,
          variantId: finalVariantId, 
          sellerId: item.product?.sellerId || item.sellerId, 
          quantity: Number(item.quantity || 1),
          unitPrice: currentUnitPrice,
          productPrice: currentUnitPrice, // बैकएंड को खुश करने के लिए दोनों चाबियाँ भेजीं
          itemTotal: currentUnitPrice * Number(item.quantity || 1),
          totalPrice: currentUnitPrice * Number(item.quantity || 1),
          variantName: sizeString, 
          productUnit: item.variant?.unit || item.product?.unit || 'g'
        };
      });
     

    const couponDisc = Number((route.params as any)?.discount || 0);
    const festiveDisc = Number((route.params as any)?.extraDiscount || 0);
    const finalGrandTotal = total;
        // 🌟 कड़क सुधार 2: बैकएंड को वही असली सबटोटल और टोटल भेजो जो कार्ट स्क्रीन से पास होकर आया है!
      const orderData = {
  customerId: user?.id,
  newDeliveryAddress: {
    fullName,
    phoneNumber: phone,
    addressLine1: address,
    city: city || "Bundi",
    state: "Rajasthan",
    postalCode: pincode || "323001",
    latitude: currentLocation?.latitude ? Number(currentLocation.latitude) : 0,
    longitude: currentLocation?.longitude ? Number(currentLocation.longitude) : 0,
  },

  paymentMethod: "cod",
  deliveryInstructions: instructions || "",

  // ✅ CartScreen से आई हुई वही values भेजो
  subtotal: subtotal,
  deliveryCharge: deliveryCharge,
  platformFee: platformFee,
  total: total,

  couponDiscount: discount,
  festiveDiscount: extraDiscount,

  items: itemsToOrder,
  orderSource: "app",
  cartOrder: true,
};

      const response = await api.post('/api/orders', orderData);

      if (response.status === 201 || response.status === 200) {
        clearCart();
        navigation.replace('OrderSuccess', { orderId: response.data.id });
      }
    } catch (error: any) {
      Alert.alert("ओह!", error.response?.data?.message || "ऑर्डर प्लेस करने में समस्या आई।");
    } finally {
      setLoading(false);
    }
  };
  // ===========================================================================
  // ===========================================================================
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
 {/* Step 1: Review Order - 🎯 कड़क फिक्स: अब कीमतें कभी 0 नहीं होंगी और डेटा हमेशा पास किया हुआ दिखेगा! */}
  {currentStep === 1 && (
    <View>
      <Text style={styles.sectionTitle}>Review Order</Text>
      
      {/* 🌟 कड़क सुधार 1: अगर कार्ट स्क्रीन से लाइव डेटा आया है तो 'passedCartItems' पर लूप चलाओ, लोकल 'cart' पर नहीं भाई! */}
      {(passedCartItems && passedCartItems.length > 0 ? passedCartItems : cart).map((item: any) => {
        
        // 🌟 कड़क सुधार 2: डेटाबेस के लाइव 'priceAtAdded' या 'price_at_added' कॉलम को प्राथमिकता दी भाई साहब
        const itemUnitPrice = Number(
          item.priceAtAdded || 
          item.price_at_added || 
          item.variant?.price || 
          item.price || 
          item.unitPrice ||
          0
        );
        
        // वैरिएंट का वजन/साइज टैग निकालने की सेफ़्टी परत
        const sizeInfo = item.variant?.quantityValue 
          ? ` (${item.variant.quantityValue} ${item.variant.unit || 'g'})` 
          : item.variantName 
            ? ` (${item.variantName})` 
            : '';
         const freeLimit = 500;
        return (
          <View key={item.id || item.variantId || item.productId} style={styles.itemRow}>
            {/* 🎯 नाम के आगे उसका वजन/साइज और मात्रा एकदम सही प्रिंट होगी भाई */}
            <Text style={styles.itemInfo}>
              {(item.product?.name || item.productName || item.name || 'Product')}{sizeInfo} x {item.quantity}
            </Text>
            {/* 🌟 कड़क सुधार 3: सही लाइव कीमत का गुणा यहाँ एकदम सटीक दिखेगा */}
            <Text style={styles.itemPrice}>₹{(itemUnitPrice * Number(item.quantity || 1)).toLocaleString('en-IN')}</Text>
          </View>
        );
      })}
      
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
{/* ==================== 🎯 100% शुद्ध कूपन + त्योहार डिस्काउंट लोडेड कार्ट चेकआउट इंजन ==================== */}

{currentStep === 3 && (
  <View>
    {/* फ्री डिलीवरी प्रोत्साहन बैनर भाई */}
    
  {deliveryCharge > 0 && (
  <View style={styles.freeDeliveryBanner}>
    <Text style={styles.freeDeliveryText}>
      सिर्फ{" "}
      <Text style={{ fontWeight: "900", color: "#2563eb" }}>
        ₹{remainingForFreeDelivery.toFixed(1)}
      </Text>{" "}
      का सामान और जोड़ें और{"\n"}
      <Text style={{ fontWeight: "900" }}>
        FREE DELIVERY
      </Text>{" "}
      पाएँ! 🚚
    </Text>
  </View>
)}
    
    <Text style={styles.sectionTitle}>Payment Summary</Text>
    <View style={styles.paymentCard}>
        <Text style={styles.payName}>Cash on Delivery</Text>
        <CheckCircle2 color="#2563eb" size={24} />
    </View>

    <View style={styles.summaryCard}>
      {/* 1. सबटोटल (शुद्ध माल का पैसा भाई साहब) */}
      <View style={styles.totalRow}>
        <Text style={styles.summaryLabel}>Subtotal (सामान की कीमत)</Text>
        <Text style={styles.summaryValue}>
          ₹{Number(subtotal).toFixed(1)}
        </Text>
      </View>
      
     {/* Delivery Charge */}
<View style={styles.totalRow}>
  <Text style={styles.summaryLabel}>
    Delivery Charge (डिलीवरी चार्ज)
  </Text>

  <Text
    style={[
      styles.summaryValue,
      deliveryCharge === 0
        ? { color: '#10b981', fontWeight: '700' }
        : { color: '#0f172a' },
    ]}
  >
    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge.toFixed(1)}`}
  </Text>
</View>

      {/* 🎛️ नया जोड़ ३: स्लैब-वाइज प्लेटफ़ॉर्म चार्ज इंजन */}
      <View style={styles.totalRow}>
        <Text style={[styles.summaryLabel, { color: '#4f46e5', fontWeight: '600' }]}>+ Platform Handling Fee (प्लेटफ़ॉर्म फीस)</Text>
        <Text style={[styles.summaryValue, { color: '#4f46e5', fontWeight: '700' }]}>
         ₹{platformFee.toFixed(1)}
        </Text>
      </View>

      {/* 🎁 नया जोड़ ४: कूपन डिस्काउंट (डेटाबेस का discount कॉलम भाई - अगर उपलब्ध हो तो ही स्क्रीन पर चमके) */}
      {Number((route.params as any)?.discount || 0) > 0 && (
        <View style={styles.totalRow}>
          <Text style={[styles.summaryLabel, { color: '#dc2626', fontWeight: '600' }]}>- Coupon Discount (कूपन चूट)</Text>
          <Text style={[styles.summaryValue, { color: '#dc2626', fontWeight: '700' }]}>
            -₹{Number((route.params as any)?.discount || 0).toFixed(1)}
          </Text>
        </View>
      )}

      {/* 🎪 नया जोड़ ५: त्योहार स्पेशल चूट (डेटाबेस का extraDiscount कॉलम भाई साहब) */}
      {Number((route.params as any)?.extraDiscount || 0) > 0 && (
        <View style={styles.totalRow}>
          <Text style={[styles.summaryLabel, { color: '#16a34a', fontWeight: '600' }]}>- Festive Discount (विशेष त्योहार चूट)</Text>
          <Text style={[styles.summaryValue, { color: '#16a34a', fontWeight: '700' }]}>
            -₹{Number((route.params as any)?.extraDiscount || 0).toFixed(1)}
          </Text>
        </View>
      )}

      <View style={styles.divider} />
      
      {/* 🎯 ६. ग्रैंड टोटल (आपका जादुई ऐतिहासिक बिज़नेस फ़ॉर्मूला लाइव सिंक भाई!) */}
      <View style={styles.totalRow}>
        <Text style={styles.grandTotal}>Total to Pay (कुल देय राशि)</Text>
        <Text style={styles.grandTotal}>
        ₹{total.toFixed(1)}
        </Text>
      </View>
    </View>

    {/* 🔥 ७. आर्डर प्लेसमेंट बटन (लाइव अंतिम सत्य प्राइस सिंक भाई!) */}
    <TouchableOpacity style={styles.placeOrderBtn} onPress={handlePlaceOrder} disabled={loading}>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.btnText}>
        Confirm Order • ₹{total.toFixed(1)}
        </Text>
      )}
    </TouchableOpacity>
  </View>
)}
{/* ==================================================================================================== */}
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
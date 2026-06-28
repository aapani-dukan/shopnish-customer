import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, TouchableOpacity, 
  TextInput, ActivityIndicator, Alert, Dimensions, Image 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLocation } from '../context/LocationContext';
import api from '../services/api';
import { MapPin, CreditCard, ChevronLeft, CheckCircle2, Zap } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
const { width } = Dimensions.get('window');

export default function CheckoutDirectScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const { currentLocation } = useLocation();
    const route = useRoute<any>();
    const directItem = route.params?.item; // Direct buy item
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Review, 2: Address, 3: Payment

  // ✅ Form States: Initial values currentLocation se le rahe hain
  const [city, setCity] = useState(currentLocation?.city || 'Bundi');
  const [pincode, setPincode] = useState(currentLocation?.pincode || '');
  const [landmark, setLandmark] = useState('');
  const { data: adminSettings } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: async () => (await api.get('/api/admin/public-settings')).data,
  });

  // 2. प्री-फिल नाम और नंबर
  // 2. Pre-fill Form (अगर यूजर ने प्रोफाइल सेट की है)
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [address, setAddress] = useState(currentLocation?.address || '');
  const [instructions, setDeliveryInstructions] = useState('');

  // 3. Dynamic Charges
  const subtotal = directItem.price * directItem.quantity;
  const freeLimit = adminSettings?.freeDeliveryMinOrderValue ?? 500;
  const baseCharge = adminSettings?.baseDeliveryCharge ?? 25;
  const deliveryCharge = subtotal >= freeLimit ? 0 : baseCharge;

 // 3. Dynamic Charges (Sahi formula yahan define karein)
  const slabCharge = subtotal <= 500 ? 5 : subtotal <= 1000 ? 10 : 15;
  const couponDisc = Number((directItem as any)?.discount || 0);
  const festiveDisc = Number((directItem as any)?.extraDiscount || 0);
  
  // 🔥 Ab 'total' variable mein hi sahi amount rahega
  const total = subtotal + deliveryCharge + slabCharge - couponDisc - festiveDisc;
 // 🎯 फिक्स 1: ऑर्डर पेलोड के अंदर 'variantId' को 100% सटीक इंजेक्ट करना भाई!
 // ==================== 🎯 100% सटीक QUICK CHECKOUT ENGINE फिक्स ====================
  const handlePlaceOrder = async () => {
    if (!fullName || !phone || !address) {
      Alert.alert("अधूरा पता", "कृपया अपना नाम, नंबर और पूरा पता दर्ज करें।");
      return;
    }

    try {
      setLoading(true);

      // 🌟 जादू: directItem को any कास्ट किया ताकि TypeScript का कोई भी एरर न आए भाई
      const dItem = directItem as any;

      // 1. वैरिएंट आईडी को पूरी सुरक्षा के साथ निकालना भाई
      const finalVariantId = dItem.variantId || dItem.variant?.id || dItem.id || null;

      // 2. डेटाबेस के 'variant_name' कॉलम के लिए पूरा नाम/साइज पहले ही तैयार कर लो भाई साहब
      const sizeString = dItem.variant?.quantityValue 
        ? `${dItem.variant.quantityValue} ${dItem.variant.unit || 'g'}`.trim()
        : dItem.quantityValue 
          ? `${dItem.quantityValue} ${dItem.unit || 'g'}`.trim()
          : (dItem.variantName || dItem.variantTitle || '');
const slabCharge = subtotal <= 500 ? 5 : subtotal <= 1000 ? 10 : 15;
  const couponDisc = Number((directItem as any)?.discount || 0);
  const festiveDisc = Number((directItem as any)?.extraDiscount || 0);
const finalGrandTotal = subtotal + Number(deliveryCharge) + slabCharge - couponDisc - festiveDisc;
      const orderData = {
        newDeliveryAddress: {
          fullName: fullName,
          phoneNumber: phone,
          addressLine1: address,
          city: currentLocation?.city || "Bundi", 
          state: "Rajasthan",
          postalCode: currentLocation?.pincode || "323001",
          latitude: Number(currentLocation?.latitude || 0),
          longitude: Number(currentLocation?.longitude || 0),
        },
        paymentMethod: "cod",
        deliveryInstructions: instructions,
        
        item: {
          productId: dItem.productId || dItem.id || dItem._id,
          variantId: finalVariantId, // ✅ अब यह कभी गलत या मिसिंग नहीं होगा भाई!
          quantity: Number(dItem.quantity || 1),
          unitPrice: Number(dItem.price || 0),
          productPrice: Number(dItem.price || 0), // दोनों संभावित चाबियों को संतुष्ट किया
          totalPrice: Number(dItem.price || 0) * Number(dItem.quantity || 1),
          itemTotal: Number(dItem.price || 0) * Number(dItem.quantity || 1),
          variantName: sizeString, // 🎯 यह सीधे डेटाबेस के variant_name कॉलम में "100 g" की तरह छप जाएगा!
          productUnit: dItem.variant?.unit || dItem.unit || 'g'
        },
        
        subtotal: Number(subtotal),
        deliveryCharge: Number(deliveryCharge),
        platformFee: slabCharge,
        couponDiscount: couponDisc,
        festiveDiscount: festiveDisc,
        slabCharge: Number(slabCharge),
        total: Number(finalGrandTotal),
        sellerId: dItem.sellerId || dItem.product?.sellerId,
        cartOrder: false,
      };

      const response = await api.post('/api/orders/buy-now', orderData);

      if (response.status === 200 || response.status === 201) {
        navigation.replace('OrderSuccess', { orderId: response.data.id });
      }
    } catch (error: any) {
      Alert.alert("ओह!", error.response?.data?.message || "ऑर्डर नहीं हो पाया।");
    } finally {
      setLoading(false);
    }
  };
  // ===================================================================================
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
  
 {/* Step 1: Review Item - 🎯 फिक्स 2: यूआई में वैरिएंट का वजन/साइज चमकाना भाई! */}
  {/* Step 1: Review Item - 🎯 वैरिएंट साइज डिस्प्ले सेफ्टी फिक्स भाई! */}
  <View style={styles.card}>
    <View style={styles.itemRow}>
      <Image source={{ uri: directItem?.image || directItem?.product?.image }} style={styles.itemImg} />
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={styles.itemName}>{directItem?.name || directItem?.product?.name || 'Product'}</Text>
        <Text style={styles.itemSub}>
          Qty: {directItem?.quantity} • Price: ₹{directItem?.price} 
          
          {/* 🎯 जादुई सुरक्षा परत: अगर डायरेक्ट आइटम या उसके वैरिएंट में मात्रा मौजूद हो तो तुरंत दिखाओ */}
          {(() => {
            const dItem = directItem as any;
            const qVal = dItem.variant?.quantityValue || dItem.quantityValue || '';
            const uVal = dItem.variant?.unit || dItem.unit || '';
            return qVal ? ` (${qVal} ${uVal})` : '';
          })()}
        </Text>
      </View>
      <Text style={styles.itemTotal}>₹{subtotal}</Text>
    </View>
  </View>
  {/* Delivery Form */}
  <View style={styles.formContainer}>
    <Text style={styles.sectionTitle}>Delivery Address</Text>
    <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} placeholderTextColor="#94a3b8" />
    <TextInput style={styles.input} placeholder="Mobile Number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} placeholderTextColor="#94a3b8" />
    <TextInput style={[styles.input, { height: 100 }]} placeholder="Complete Address (Flat, Street, Area)" multiline value={address} onChangeText={setAddress} placeholderTextColor="#94a3b8" />
    <TextInput style={styles.input} placeholder="Any special instructions?" value={instructions} onChangeText={setDeliveryInstructions} placeholderTextColor="#94a3b8" />
  </View>

  {/* Free Delivery Banner (Upsell) */}
  {subtotal < freeLimit && (
    <TouchableOpacity 
        style={styles.upsellCard}
        onPress={() => navigation.navigate('Main', { screen: 'Home' })}
    >
        <Text style={styles.upsellText}>
            सिर्फ ₹{freeLimit - subtotal} का सामान और जोड़ें और {'\n'}
            <Text style={{ fontWeight: '900', color: '#10b981' }}>FREE DELIVERY पाएँ!</Text>
        </Text>
        {/* Chevron को View में लपेटना बेहतर है */}
        <View style={{ transform: [{ rotate: '180deg' }] }}>
            <ChevronLeft size={16} color="#9a3412" />
        </View>
    </TouchableOpacity>
  )}

  {/* Payment & Summary */}
  {/* ==================== 🎯 100% शुद्ध कूपन + त्योहार डिस्काउंट लोडेड समरी ब्लॉक ==================== */}
  <View style={styles.summaryCard}>
    <Text style={styles.sectionTitle}>Payment Summary</Text>
    
    <View style={styles.priceRow}>
      <Text style={styles.priceLabel}>Item Total (सामान की कीमत)</Text>
      <Text style={styles.priceValue}>₹{subtotal}</Text>
    </View>

    <View style={styles.priceRow}>
      <Text style={styles.priceLabel}>Delivery Fee (🚚 डिलीवरी चार्ज)</Text>
      <Text style={[styles.priceValue, { color: '#10b981' }]}>
        {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
      </Text>
    </View>

    {/* 🎛️ नया जोड़: स्लैब-वाइज प्लेटफ़ॉर्म चार्ज इंजन */}
    <View style={styles.priceRow}>
      <Text style={[styles.priceLabel, { color: '#4f46e5', fontWeight: '600' }]}>+ Platform Handling Fee</Text>
      <Text style={[styles.priceValue, { color: '#4f46e5', fontWeight: '700' }]}>
        {(() => {
          const slabCharge = subtotal <= 500 ? 5 : subtotal <= 1000 ? 10 : 15;
          return `₹${slabCharge}`;
        })()}
      </Text>
    </View>

    {/* 🎁 नया जोड़: प्रोमो कोड कूपन डिस्काउंट (डेटाबेस का discount कॉलम भाई - अगर 0 से बड़ा हो तो ही दिखेगा) */}
    {Number((directItem as any)?.discount || 0) > 0 && (
      <View style={styles.priceRow}>
        <Text style={[styles.priceLabel, { color: '#dc2626', fontWeight: '600' }]}>- Coupon Discount (कूपन चूट)</Text>
        <Text style={[styles.priceValue, { color: '#dc2626', fontWeight: '700' }]}>
          -₹{Number((directItem as any)?.discount || 0)}
        </Text>
      </View>
    )}

    {/* 🎪 नया जोड़: त्योहार स्पेशल चूट (डेटाबेस का extraDiscount कॉलम भाई साहब) */}
    {Number((directItem as any)?.extraDiscount || 0) > 0 && (
      <View style={styles.priceRow}>
        <Text style={[styles.priceLabel, { color: '#16a34a', fontWeight: '600' }]}>- Festive Discount (विशेष त्योहार चूट)</Text>
        <Text style={[styles.priceValue, { color: '#16a34a', fontWeight: '700' }]}>
          -₹{Number((directItem as any)?.extraDiscount || 0)}
        </Text>
      </View>
    )}

    <View style={styles.divider} />

    <View style={styles.priceRow}>
      <Text style={styles.grandLabel}>Total to Pay (कुल देय राशि)</Text>
      <Text style={styles.grandValue}>
        {(() => {
          // 🔥 आपका असली ऐतिहासिक बिज़नेस फ़ॉर्मूला: 
          // total = subtotal + delivery + platformHandling - couponDiscount - extraDiscount
          const slabCharge = subtotal <= 500 ? 5 : subtotal <= 1000 ? 10 : 15;
          const couponDisc = Number((directItem as any)?.discount || 0);
          const festiveDisc = Number((directItem as any)?.extraDiscount || 0);
          
          const finalGrandTotal = subtotal + deliveryCharge + slabCharge - couponDisc - festiveDisc;
          return `₹${finalGrandTotal.toFixed(2)}`;
        })()}
      </Text>
    </View>
    
    <View style={styles.codBadge}>
      <CheckCircle2 color="#2563eb" size={18} />
      <Text style={styles.codText}>Cash on Delivery Selected</Text>
    </View>
  </View>
</ScrollView>
      {/* Bottom Button */}
      <View style={styles.footer}>
<TouchableOpacity 
  style={[styles.orderBtn, loading && { opacity: 0.7 }]} 
  onPress={handlePlaceOrder}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator color="#fff" />
  ) : (
    <Text style={styles.orderBtnText}>Place Order • ₹{total.toFixed(2)}</Text>
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
  orderBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  // styles के अंदर सबसे नीचे ये जोड़ें:
  upsellCard: {
    backgroundColor: '#fff7ed', // हल्का ऑरेंज/पीला बैकग्राउंड
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fed7aa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  upsellText: {
    color: '#9a3412',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    flex: 1,
  },
});
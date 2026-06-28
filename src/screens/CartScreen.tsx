import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ChevronRight, ShoppingBag, Truck, Info } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
export default function CartScreen() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { refreshCart } = useCart();

  const { data: cartData, isLoading } = useQuery<any>({
    queryKey: ['/api/cart'],
    retry: false, 
  });

  const cartItems = cartData?.items || [];

 // 🎯 बैकएंड PUT /api/cart/:cartItemId के अनुसार अपडेट म्यूटेशन फिक्स भाई
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: number, quantity: number }) => {
      // यूआरएल में cartItemId जाएगा और बॉडी में सिर्फ quantity जाएगी भाई साहब
      return apiRequest("PUT", `/api/cart/${cartItemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      refreshCart();
    }
  });

  // 🎯 बैकएंड DELETE /api/cart/:cartItemId के अनुसार रिमूव म्यूटेशन फिक्स भाई
  const removeItemMutation = useMutation({
    mutationFn: async ({ cartItemId }: { cartItemId: number }) => {
      // सीधे DELETE मेथड का इस्तेमाल और यूआरएल में आईडी पास भाई
      return apiRequest("DELETE", `/api/cart/${cartItemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      refreshCart();
    }
  });
  // 🎯 फिक्स 3: हैंडलर में 'item' का पूरा संदर्भ पास करेंगे ताकि आईडी और वैरिएंट दोनों मिल सकें भाई
 // 🎯 फिक्स 3: हैंडलर में डेटाबेस की रियल 'id' (Primary Key) को प्राथमिकता दी भाई साहब!
  const handleUpdateQuantity = (cartItem: any, delta: number) => {
    const productId = cartItem.productId || cartItem.product?.id;
    const variantId = cartItem.variantId || cartItem.variant?.id || null;
    const newQty = cartItem.quantity + delta;

    if (newQty > 0) {
      // अगर बैकएंड को सिर्फ कार्ट आइटम की मुख्य ID चाहिए तो 'id: cartItem.id' भी पेलोड में पास कर सकते हैं भाई
      updateQuantityMutation.mutate({ cartItemId: cartItem.id, quantity: newQty });
    } else {
      handleRemove(cartItem);
    }
  };

  const handleRemove = (cartItem: any) => {
    const productId = cartItem.productId || cartItem.product?.id;
    const variantId = cartItem.variantId || cartItem.variant?.id || null;
    
    // सुरक्षा फॉलबैक: डिलीट के लिए कंफर्मेशन बॉक्स का साइज लेबल
    const qVal = cartItem.variant?.quantityValue || cartItem.quantityValue || '';
    const uVal = cartItem.variant?.unit || cartItem.unit || '';
    const displaySize = qVal ? ` (${qVal} ${uVal})` : cartItem.variantName ? ` (${cartItem.variantName})` : '';

    Alert.alert("Remove Item", `Remove "${cartItem.product?.name || cartItem.name || 'Item'}"${displaySize} from your bag?`, [
      { text: "Cancel", style: 'cancel' },
      { 
        text: "Remove", 
        style: 'destructive', 
        onPress: () => {
          // 🌟 जादू: म्यूटेशन को सीधे डेटाबेस रो की ID या कंबाइंड ट्रैकर पास करो 
       removeItemMutation.mutate({ cartItemId: cartItem.id });
        } 
      }
    ]);
  };
 // 🎯 फिक्स 1: डिलीवरी हिंट को डायनामिक किया भाई, ₹500 से कम होने पर फ्री डिलीवरी का झूठा बैनर नहीं दिखेगा!
  const ListHeader = () => {
    const currentCartTotal = Number(cartData?.totalAmount || 0);
    
    // Agar order ₹500 ya usse jyada hai, tabhi Free Delivery ka badhai message dikhao
    if (currentCartTotal >= 500) {
      return (
        <View style={styles.deliveryHint}>
          <Truck size={18} color="#10b981" />
          <Text style={styles.deliveryText}>Yay! You get **Free Delivery** on this order.</Text>
        </View>
      );
    }

    // Agar ₹500 se kam hai, toh alert hint dikhao ki kitne ka saaman aur jodhna hai
    return (
      <View style={[styles.deliveryHint, { backgroundColor: '#fef3c7', borderColor: '#fde68a' }]}>
        <Truck size={18} color="#d97706" />
        <Text style={[styles.deliveryText, { color: '#92400e' }]}>
          Add **₹{(500 - currentCartTotal).toFixed(1)}** more to unlock **Free Delivery**! 🚚
        </Text>
      </View>
    );
  };
 // 🎯 फिक्स 4: डेटाबेस के price_at_added और total_price कॉलम को फ्रंटएंड से बाइंड किया भाई!
  const renderItem = ({ item }: any) => {
    
    // 🌟 कड़क सुधार: जो डेटाबेस में 'price_at_added' सेव है, सीधे उसी लाइव कीमत को रेंडर करो भाई साहब!
    const currentPrice = Number(
      item.priceAtAdded || 
      item.price_at_added || 
      item.variant?.price || 
      item.price || 
      0
    );

    // वैरिएंट साइज टैग के लिए वॉटरप्रूफ फॉलबैक
    const sizeLabel = item.variant?.quantityValue 
      ? `${item.variant.quantityValue} ${item.variant.unit || 'g'}` 
      : item.variantName 
        ? item.variantName 
        : null;
    return (
      <View style={styles.cartItem}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.product?.image || item.image }} style={styles.itemImage} />
        </View>
        <View style={styles.itemDetails}>
          <View style={styles.rowBetween}>
            <Text style={styles.itemName} numberOfLines={1}>{item.product?.name || item.name}</Text>
            <TouchableOpacity onPress={() => handleRemove(item)}>
              <Trash2 size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 8 }}>
            <Text style={styles.itemSeller}>{item.product?.seller?.businessName || "Verified Shop"}</Text>
            {/* 🎯 जादुई टच: अगर वैरिएंट का साइज उपलब्ध है तो छोटा सा सुंदर टैग दिखाओ भाई */}
            {sizeLabel && (
              <View style={{ backgroundColor: '#eff6ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 0.5, borderColor: '#bfdbfe' }}>
                <Text style={{ fontSize: 10, color: '#2563eb', fontWeight: '700' }}>{sizeLabel}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.actionRow}>
            {/* 🎯 फिक्स 5: पैरेंट के बजाय सीधे वैरिएंट की लाइव कीमत रेंडर होगी भाई */}
            <Text style={styles.itemPrice}>₹{Number(currentPrice).toLocaleString('en-IN')}</Text>
            <View style={styles.stepper}>
              <TouchableOpacity 
                onPress={() => handleUpdateQuantity(item, -1)} 
                style={styles.stepBtn}
              >
                <Minus size={14} color="#0f172a" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity 
                onPress={() => handleUpdateQuantity(item, 1)} 
                style={styles.stepBtn}
              >
                <Plus size={14} color="#0f172a" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };
  if (isLoading) return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Bag</Text>
          <Text style={styles.itemCount}>{cartItems.length} items selected</Text>
        </View>
        <TouchableOpacity style={styles.infoIcon}>
          <Info size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        ListHeaderComponent={cartItems.length > 0 ? ListHeader : null}
        ListEmptyComponent={<EmptyCart navigation={navigation} />}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />

   {/* 🎯 कार्ट स्क्रीन फ़ुटर फिक्स: डिलीवरी चार्ज और कुल पेमेंट का गणित एकदम लाइव सिंक भाई! */}
      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              {/* ✅ यहाँ 'style style' को ठीक कर के सिंगल 'style' कर दिया है भाई साहब */}
              <Text style={styles.priceValue}>₹{cartData?.totalAmount || 0}</Text>
            </View>
            
            {/* 🌟 कड़क सुधार 1: अब ₹500 से कम का सामान होने पर यहाँ FREE नहीं, बल्कि '₹25' दिखेगा भाई साहब */}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery</Text>
              <Text style={[
                styles.priceValue, 
                Number(cartData?.totalAmount || 0) >= 500 ? { color: '#10b981', fontWeight: '700' } : { color: '#0f172a' }
              ]}>
                {Number(cartData?.totalAmount || 0) >= 500 ? 'FREE' : '₹25'}
              </Text>
            </View>
          </View>
<View style={styles.priceRow}>
  <Text style={styles.priceLabel}>Platform Handling Fee</Text>
  <Text style={[styles.priceValue, { color: '#4f46e5', fontWeight: '700' }]}>
    {(() => {
      const slab = Number(cartData?.totalAmount || 0) <= 500 ? 5 : 
                   Number(cartData?.totalAmount || 0) <= 1000 ? 10 : 15;
      return `₹${slab}`;
    })()}
  </Text>
</View>
          
          <TouchableOpacity 
            activeOpacity={0.9}
            style={styles.checkoutBtn}
         onPress={() => {
  if (cartItems && cartItems.length > 0) {
    // 1. Safe Values nikal lo (adminSettings se)
    const subtotalVal = Number(cartData?.totalAmount || 0);
    const freeLimitVal = 500; // Admin settings se bhi le sakte ho agar dynamic chahiye
    
    // 2. Calculations
    const delivery = subtotalVal >= freeLimitVal ? 0 : 25;
    const slab = subtotalVal <= 500 ? 5 : subtotalVal <= 1000 ? 10 : 15;
    
    // 3. Discount safe tarike se
    const couponDisc = Number(cartData?.discount || 0);
    const festiveDisc = Number(cartData?.extraDiscount || 0);
    const remainingForFreeDelivery = Math.max(
  0,
  freeLimitVal - subtotalVal
);
    // 4. Final Total (Logic एकदम सटीक)
    const finalTotalToSend = subtotalVal + delivery + slab - couponDisc - festiveDisc;
    navigation.navigate('Checkout', {
    passedCartItems: cartItems,
    subtotal: subtotalVal,
    deliveryCharge: delivery,
    platformFee: slab,
    totalAmount: finalTotalToSend,
    discount: couponDisc,
    extraDiscount: festiveDisc,
    remainingForFreeDelivery
});

              } else {
                Alert.alert("बैग खाली है भाई साहब!", "कृपया चेकआउट करने से पहले कार्ट में कुछ सामान जोड़ें।");
              }
            }}
          >
            <View>
              {/* 🌟 कड़क सुधार 3: बटन के ऊपर कुल देय राशि एकदम सटीक (₹274.6) प्लस होकर चमकेगी */}
            <Text style={styles.checkoutTotal}>
  ₹{(Number(cartData?.totalAmount || 0) + 
     (Number(cartData?.totalAmount || 0) >= 500 ? 0 : 25) + 
     (Number(cartData?.totalAmount || 0) <= 500 ? 5 : Number(cartData?.totalAmount || 0) <= 1000 ? 10 : 15)
   ).toFixed(1)}
</Text>
              <Text style={styles.checkoutSub}>Total Payable</Text>
            </View>
            <View style={styles.btnAction}>
              <Text style={styles.checkoutText}>Checkout</Text>
              <ChevronRight color="#fff" size={20} strokeWidth={3} />
            </View>
          </TouchableOpacity> 
        </View>
      )}
    </SafeAreaView>
  );
}
const EmptyCart = ({ navigation }: any) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconCircle}>
      <ShoppingBag size={50} color="#cbd5e1" strokeWidth={1.5} />
    </View>
    <Text style={styles.emptyTitle}>Your bag is empty</Text>
    <Text style={styles.emptySub}>Looks like you haven't added anything yet.</Text>
    <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Home')}>
      <Text style={styles.shopBtnText}>Explore Products</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 },
  itemCount: { fontSize: 14, color: '#94a3b8', fontWeight: '600' },
  infoIcon: { padding: 8, backgroundColor: '#f8fafc', borderRadius: 12 },
  
  deliveryHint: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfdf5', padding: 12, borderRadius: 16, marginBottom: 20, gap: 8 },
  deliveryText: { fontSize: 13, color: '#065f46', fontWeight: '600' },

  cartItem: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#fff' },
  imageContainer: { width: 100, height: 110, borderRadius: 20, backgroundColor: '#f8fafc', overflow: 'hidden' },
  itemImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  itemDetails: { flex: 1, marginLeft: 16, justifyContent: 'space-between', paddingVertical: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemName: { fontSize: 17, fontWeight: '800', color: '#1e293b', flex: 1, marginRight: 10 },
  itemSeller: { fontSize: 13, color: '#94a3b8', fontWeight: '500', marginTop: 2 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  itemPrice: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4 },
  stepBtn: { width: 32, height: 32, backgroundColor: '#fff', borderRadius: 8, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 },
  quantityText: { fontSize: 14, fontWeight: '900', paddingHorizontal: 12, color: '#0f172a' },

  footer: { 
    position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', 
    paddingHorizontal: 20, paddingTop: 15, paddingBottom: Platform.OS === 'ios' ? 35 : 20,
    borderTopWidth: 1, borderTopColor: '#f1f5f9'
  },
  priceBreakdown: { marginBottom: 15 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  priceLabel: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  priceValue: { fontSize: 14, color: '#0f172a', fontWeight: '700' },

  checkoutBtn: { 
    backgroundColor: '#2563eb', flexDirection: 'row', justifyContent: 'space-between', 
    alignItems: 'center', padding: 16, borderRadius: 22, elevation: 8,
    shadowColor: '#2563eb', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }
  },
  checkoutTotal: { color: '#fff', fontSize: 20, fontWeight: '900' },
  checkoutSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  btnAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  checkoutText: { color: '#fff', fontWeight: '900', fontSize: 16 },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyIconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: '#0f172a' },
  emptySub: { fontSize: 15, color: '#64748b', marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },
  shopBtn: { marginTop: 30, backgroundColor: '#0f172a', paddingVertical: 16, paddingHorizontal: 35, borderRadius: 18 },
  shopBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 }
});
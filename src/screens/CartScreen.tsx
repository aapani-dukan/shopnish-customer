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

 // 🎯 फिक्स 1: क्वांटिटी अपडेट में अब productId के साथ variantId भी जाएगा भाई!
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, variantId, quantity }: { productId: string, variantId: string | null, quantity: number }) => {
      return apiRequest("POST", "/api/cart/update", { productId, variantId, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      refreshCart();
    }
  });

  // 🎯 फिक्स 2: रिमूव आइटम के एंडपॉइंट में भी अब विशिष्ट variantId जाएगा भाई
  const removeItemMutation = useMutation({
    mutationFn: async ({ productId, variantId }: { productId: string, variantId: string | null }) => {
      return apiRequest("POST", "/api/cart/remove", { productId, variantId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      refreshCart();
    }
  });

  // 🎯 फिक्स 3: हैंडलर में 'item' का पूरा संदर्भ पास करेंगे ताकि आईडी और वैरिएंट दोनों मिल सकें भाई
  const handleUpdateQuantity = (cartItem: any, delta: number) => {
    const productId = cartItem.productId || cartItem.product?.id;
    const variantId = cartItem.variantId || cartItem.variant?.id || null;
    const newQty = cartItem.quantity + delta;

    if (newQty > 0) {
      updateQuantityMutation.mutate({ productId, variantId, quantity: newQty });
    } else {
      handleRemove(cartItem);
    }
  };

  const handleRemove = (cartItem: any) => {
    const productId = cartItem.productId || cartItem.product?.id;
    const variantId = cartItem.variantId || cartItem.variant?.id || null;
    const displaySize = cartItem.variant?.quantityValue ? ` (${cartItem.variant.quantityValue} ${cartItem.variant.unit})` : '';

    Alert.alert("Remove Item", `Remove "${cartItem.product?.name || 'Item'}"${displaySize} from your bag?`, [
      { text: "Cancel", style: 'cancel' },
      { text: "Remove", style: 'destructive', onPress: () => removeItemMutation.mutate({ productId, variantId }) }
    ]);
  };
  const ListHeader = () => (
    <View style={styles.deliveryHint}>
      <Truck size={18} color="#10b981" />
      <Text style={styles.deliveryText}>Yay! You get **Free Delivery** on this order.</Text>
    </View>
  );

 // 🎯 फिक्स 4: कार्ट लिस्ट के अंदर वैरिएंट का नाम, साइज और सही लाइव कीमत दिखाना भाई!
  const renderItem = ({ item }: any) => {
    // बैकएंड के नए रिस्पॉन्स स्ट्रक्चर के अनुसार प्राइजिंग निकालो भाई
    const currentPrice = item.variant?.price || item.price || 0;
    const sizeLabel = item.variant?.quantityValue ? `${item.variant.quantityValue} ${item.variant.unit}` : null;

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

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>₹{cartData?.totalAmount || 0}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery</Text>
              <Text style={[styles.priceValue, {color: '#10b981'}]}>FREE</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            activeOpacity={0.9}
            style={styles.checkoutBtn}
            onPress={() => navigation.navigate('Checkout')}
          >
            <View>
              <Text style={styles.checkoutTotal}>₹{cartData?.totalAmount || 0}</Text>
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
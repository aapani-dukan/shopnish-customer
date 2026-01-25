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

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string, quantity: number }) => {
      return apiRequest("POST", "/api/cart/update", { productId, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      refreshCart();
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiRequest("DELETE", `/api/cart/remove/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      refreshCart();
    }
  });

  const handleUpdateQuantity = (id: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty > 0) {
      updateQuantityMutation.mutate({ productId: id, quantity: newQty });
    } else {
      handleRemove(id);
    }
  };

  const handleRemove = (id: string) => {
    Alert.alert("Remove Item", "Remove this from your bag?", [
      { text: "Cancel", style: 'cancel' },
      { text: "Remove", style: 'destructive', onPress: () => removeItemMutation.mutate(id) }
    ]);
  };

  const ListHeader = () => (
    <View style={styles.deliveryHint}>
      <Truck size={18} color="#10b981" />
      <Text style={styles.deliveryText}>Yay! You get **Free Delivery** on this order.</Text>
    </View>
  );

  const renderItem = ({ item }: any) => {
    const productId = item.productId || item.product?.id || item.id;
    return (
      <View style={styles.cartItem}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.product?.image || item.image }} style={styles.itemImage} />
        </View>
        <View style={styles.itemDetails}>
          <View style={styles.rowBetween}>
            <Text style={styles.itemName} numberOfLines={1}>{item.product?.name || item.name}</Text>
            <TouchableOpacity onPress={() => handleRemove(productId)}>
              <Trash2 size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>
          <Text style={styles.itemSeller}>{item.product?.seller?.businessName || "Verified Shop"}</Text>
          
          <View style={styles.actionRow}>
            <Text style={styles.itemPrice}>₹{item.product?.price || item.price}</Text>
            <View style={styles.stepper}>
              <TouchableOpacity 
                onPress={() => handleUpdateQuantity(productId, item.quantity, -1)} 
                style={styles.stepBtn}
              >
                <Minus size={14} color="#0f172a" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity 
                onPress={() => handleUpdateQuantity(productId, item.quantity, 1)} 
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
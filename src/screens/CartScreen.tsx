import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ChevronRight, ShoppingBag } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function CartScreen() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { refreshCart } = useCart();

  // 1. Fetch Real Cart Data from Backend
  const { data: cartData, isLoading } = useQuery<any>({
    queryKey: ['/api/cart'],
  });

  const cartItems = cartData?.items || [];

  // 2. Quantity Update Mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string, quantity: number }) => {
      return apiRequest("POST", "/api/cart/update", { productId, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      refreshCart();
    }
  });

  // 3. Remove Item Mutation
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
    Alert.alert("Remove Item", "Kya aap is item ko bag se hatana chahte hain?", [
      { text: "Nahi" },
      { text: "Haan", style: 'destructive', onPress: () => removeItemMutation.mutate(id) }
    ]);
  };

  const EmptyCart = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <ShoppingBag size={50} color="#94a3b8" />
      </View>
      <Text style={styles.emptyTitle}>Aapka Bag Khali Hai!</Text>
      <Text style={styles.emptySub}>Chaliye kuch behtareen dhundte hain.</Text>
      <TouchableOpacity 
        style={styles.shopBtn} 
       onPress={() => navigation.navigate('Main', { screen: 'Home' })} 
      >
        <Text style={styles.shopBtnText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: any) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.product?.image || item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={1}>{item.product?.name || item.name}</Text>
        <Text style={styles.itemSeller}>{item.product?.seller?.businessName || "Premium Seller"}</Text>
        <Text style={styles.itemPrice}>₹{item.product?.price || item.price}</Text>
        
        <View style={styles.quantityRow}>
          <View style={styles.stepper}>
            <TouchableOpacity 
              onPress={() => handleUpdateQuantity(item.productId || item.id, item.quantity, -1)} 
              style={styles.stepBtn}
              disabled={updateQuantityMutation.isPending}
            >
              <Minus size={16} color={updateQuantityMutation.isPending ? "#cbd5e1" : "#000"} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity 
              onPress={() => handleUpdateQuantity(item.productId || item.id, item.quantity, 1)} 
              style={styles.stepBtn}
              disabled={updateQuantityMutation.isPending}
            >
              <Plus size={16} color={updateQuantityMutation.isPending ? "#cbd5e1" : "#000"} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            onPress={() => handleRemove(item.productId || item.id)} 
            style={styles.deleteBtn}
          >
            <Trash2 size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (isLoading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Bag</Text>
        <Text style={styles.itemCount}>{cartItems.length} Items</Text>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => (item.productId || item.id).toString()}
        renderItem={renderItem}
        ListEmptyComponent={EmptyCart}
        contentContainerStyle={{ padding: 20 }}
      />

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalAmount}>₹{cartData?.totalAmount || 0}</Text>
            </View>
            <TouchableOpacity 
              style={styles.checkoutBtn}
              onPress={() => navigation.navigate('Checkout')}
            >
              <Text style={styles.checkoutText}>Proceed to Pay</Text>
              <ChevronRight color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#0f172a' },
  itemCount: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  cartItem: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, padding: 12, marginBottom: 15, elevation: 2 },
  itemImage: { width: 90, height: 90, borderRadius: 15, backgroundColor: '#f1f5f9' },
  itemDetails: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  itemName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  itemSeller: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
  itemPrice: { fontSize: 18, fontWeight: '900', color: '#2563eb', marginBottom: 5 },
  quantityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 10, padding: 2 },
  stepBtn: { padding: 8 },
  quantityText: { fontSize: 15, fontWeight: 'bold', paddingHorizontal: 10 },
  deleteBtn: { padding: 8, backgroundColor: '#fef2f2', borderRadius: 10 },
  footer: { backgroundColor: '#fff', padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 12, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' },
  totalAmount: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
  checkoutBtn: { backgroundColor: '#2563eb', flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 25, borderRadius: 18, elevation: 5 },
  checkoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginRight: 5 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  emptySub: { fontSize: 14, color: '#64748b', marginTop: 5 },
  shopBtn: { marginTop: 25, backgroundColor: '#0f172a', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 15 },
  shopBtnText: { color: '#fff', fontWeight: 'bold' }
});
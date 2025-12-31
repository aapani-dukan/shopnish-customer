import React, { useState } from 'react';
import { 
  View, Text, Image, ScrollView, StyleSheet, 
  TouchableOpacity, ActivityIndicator, Dimensions, Alert, StatusBar 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ShoppingCart, Minus, Plus, ChevronLeft, Star, Share2, ShieldCheck } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // React Query components
import { apiRequest } from '../lib/queryClient'; // Humara common requester
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

export default function ProductDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { productId } = route.params as { productId: number };
  const { refreshCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  // 1. Fetch Product Details via React Query
  const { data: product, isLoading, isError } = useQuery<any>({
    queryKey: [`/api/products/${productId}`],
  });

  // 2. Add to Cart Mutation (Modern way to handle POST)
  const cartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/cart/add", {
        productId: product.id,
        quantity: quantity
      });
    },
    onSuccess: () => {
      refreshCart(); // Context update karein
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] }); // Cache refresh
      Alert.alert("Added to Cart ✅", `${product.name} basket mein add ho gaya hai.`, [
        { text: "Continue" },
        { text: "View Cart", onPress: () => navigation.navigate('Cart') }
      ]);
    },
    onError: () => {
      Alert.alert("Oops!", "Cart update fail ho gaya.");
    }
  });

  if (isLoading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );

  if (isError || !product) return (
    <View style={styles.center}>
      <Text>Product details nahi mil payi.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      
      <View style={styles.headerButtons}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
          <ChevronLeft color="#000" size={24} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconCircle}>
          <Share2 color="#000" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: product.image }} style={styles.mainImage} />
        </View>
        
        <View style={styles.contentCard}>
          <View style={styles.handle} />
          
          <View style={styles.rowBetween}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{product.isTopSeller ? "Top Seller" : "Premium"}</Text>
            </View>
            <View style={styles.ratingBox}>
              <Star size={14} color="#f59e0b" fill="#f59e0b" />
              <Text style={styles.ratingText}>
                {product.rating || "4.5"} ({product.reviewCount || "0"}+ Reviews)
              </Text>
            </View>
          </View>

          <Text style={styles.name}>{product.name}</Text>
          {/* Real Seller/Brand name from API */}
          <Text style={styles.brand}>{product.seller?.businessName || product.brand || "Verified Seller"}</Text>
          
          <View style={styles.priceContainer}>
             <View>
                <Text style={styles.priceLabel}>Best Price</Text>
                <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{product.price}</Text>
                    {product.originalPrice && (
                      <Text style={styles.oldPrice}>₹{product.originalPrice}</Text>
                    )}
                </View>
             </View>
             <View style={styles.stepper}>
                <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.stepBtn}>
                  <Minus size={18} color="#000" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.stepBtn}>
                  <Plus size={18} color="#000" />
                </TouchableOpacity>
             </View>
          </View>

          <View style={styles.divider} />
          
          <View style={styles.featureRow}>
             <View style={styles.featureItem}>
                <ShieldCheck size={20} color="#10b981" />
                <Text style={styles.featureText}>100% Original</Text>
             </View>
             <View style={styles.featureItem}>
                <Text style={{fontSize: 18}}>🚚</Text>
                <Text style={styles.featureText}>Fast Delivery</Text>
             </View>
          </View>

          <Text style={styles.sectionTitle}>Product Description</Text>
          <Text style={styles.description}>
            {product.description || "Is product ki details jald hi update ki jayengi."}
          </Text>
        </View>
      </ScrollView>

      {/* 💎 ShopNish Ultra-Premium Sticky Footer */}
      <View style={styles.footer}>
        <View style={styles.footerPrice}>
            <Text style={styles.footerLabel}>Total Amount</Text>
            <Text style={styles.totalPriceText}>₹{product.price * quantity}</Text>
        </View>
        
        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={[styles.addToCartFullBtn, (cartMutation.isPending || product.stock === 0) && { opacity: 0.6 }]} 
            onPress={() => cartMutation.mutate()}
            disabled={cartMutation.isPending || product.stock === 0}
          >
            {cartMutation.isPending ? (
              <ActivityIndicator color="#2563eb" size="small" />
            ) : (
              <View style={styles.btnContent}>
                <ShoppingCart color="#2563eb" size={18} />
                <Text style={styles.addToCartText}>Add</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.buyNowBtn, product.stock === 0 && { backgroundColor: '#94a3b8' }]} 
            onPress={() => {
              if (product.stock > 0) {
                navigation.navigate('CheckoutDirect', { 
                  item: { ...product, quantity } 
                });
              }
            }}
            disabled={product.stock === 0}
          >
            <Text style={styles.buyNowText}>
              {product.stock === 0 ? "Out of Stock" : "Buy Now"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerButtons: { 
    position: 'absolute', top: 50, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 
  },
  iconCircle: { width: 45, height: 45, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  imageWrapper: { width: width, height: 420, backgroundColor: '#e2e8f0' },
  mainImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  contentCard: { 
    marginTop: -40, backgroundColor: '#fff', borderTopLeftRadius: 40, borderTopRightRadius: 40,
    padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10
  },
  handle: { width: 40, height: 5, backgroundColor: '#e2e8f0', borderRadius: 10, alignSelf: 'center', marginBottom: 20 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  tag: { backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  tagText: { color: '#2563eb', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  ratingBox: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 5, fontSize: 13, color: '#64748b', fontWeight: '500' },
  name: { fontSize: 26, fontWeight: '800', color: '#0f172a' },
  brand: { fontSize: 16, color: '#64748b', marginTop: 4, fontWeight: '500' },
  priceContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 25 },
  priceLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 2, fontWeight: 'bold' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  price: { fontSize: 32, fontWeight: '900', color: '#2563eb' },
  oldPrice: { fontSize: 18, color: '#94a3b8', textDecorationLine: 'line-through', marginLeft: 10 },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 15, padding: 4 },
  stepBtn: { width: 38, height: 38, backgroundColor: '#fff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  quantityText: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 15, color: '#0f172a' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 25 },
  featureRow: { flexDirection: 'row', gap: 20, marginBottom: 25 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f8fafc', padding: 10, borderRadius: 12 },
  featureText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 10 },
  description: { fontSize: 15, color: '#64748b', lineHeight: 24, letterSpacing: 0.3 },
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    width: '100%', 
    backgroundColor: '#fff', 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 18, 
    borderTopWidth: 1, 
    borderTopColor: '#f1f5f9',
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  footerPrice: { flex: 1 },
  footerLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' },
  totalPriceText: { fontSize: 22, fontWeight: '900', color: '#0f172a' },
  buttonGroup: { flex: 2.2, flexDirection: 'row', alignItems: 'center', gap: 10 },
  addToCartFullBtn: { 
    flex: 0.7, 
    height: 56, 
    borderRadius: 18, 
    backgroundColor: '#eff6ff', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#dbeafe'
  },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addToCartText: { color: '#2563eb', fontSize: 15, fontWeight: '800' },
  buyNowBtn: { 
    flex: 1, 
    height: 56, 
    borderRadius: 18, 
    backgroundColor: '#2563eb', 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 6,
    shadowColor: '#2563eb', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 10
  },
  buyNowText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
});
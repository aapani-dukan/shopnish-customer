import React, { useState } from 'react';
import { 
  View, Text, Image, ScrollView, StyleSheet, 
  TouchableOpacity, ActivityIndicator, Dimensions, Alert, StatusBar, Platform 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ShoppingCart, Minus, Plus, ChevronLeft, Star, Share2, ShieldCheck, Clock } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useCart } from '../context/CartContext';

const { width, height } = Dimensions.get('window');

export default function ProductDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { productId } = route.params as { productId: number };
  const { refreshCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, isError } = useQuery<any>({
    queryKey: [`/api/products/${productId}`],
  });

  const cartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/cart/add", {
        productId: product.id,
        quantity: quantity
      });
    },
    onSuccess: () => {
      refreshCart();
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      Alert.alert("Added to Basket 🛍️", `${product.name} is ready for you.`);
    },
  });

  if (isLoading) return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;
  if (isError || !product) return <View style={styles.center}><Text>Something went wrong!</Text></View>;

  return (
    <View style={styles.container}>
      {/* 1. Ultra-Clean StatusBar & Header */}
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      
      <View style={styles.headerButtons}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.blurIcon}>
          <ChevronLeft color="#0f172a" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.blurIcon}>
          <Share2 color="#0f172a" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* 2. Full Width Premium Image */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: product.image }} style={styles.mainImage} />
          {product.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{product.discount}% OFF</Text>
            </View>
          )}
        </View>
        
        <View style={styles.contentCard}>
          <View style={styles.handle} />
          
          <View style={styles.rowBetween}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{product.isTopSeller ? "🔥 Best Seller" : "✨ Premium"}</Text>
            </View>
            <View style={styles.ratingBox}>
              <Star size={14} color="#f59e0b" fill="#f59e0b" />
              <Text style={styles.ratingText}>{product.rating || "4.5"}</Text>
              <Text style={styles.reviewCount}>({product.reviewCount || "120"}+)</Text>
            </View>
          </View>

          <Text style={styles.name}>{product.name}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ShopDetails', { sellerId: product.seller?.id, shopName: product.seller?.businessName })}>
             <Text style={styles.brand}>Visit {product.seller?.businessName || "Store"} ›</Text>
          </TouchableOpacity>
          
          {/* 3. New Pricing & Stepper UI */}
          <View style={styles.priceContainer}>
             <View style={styles.priceInfo}>
                <View style={styles.priceRow}>
                    <Text style={styles.currency}>₹</Text>
                    <Text style={styles.price}>{product.price}</Text>
                    {product.originalPrice && (
                      <Text style={styles.oldPrice}>₹{product.originalPrice}</Text>
                    )}
                </View>
                <Text style={styles.taxLabel}>Inclusive of all taxes</Text>
             </View>
             
             <View style={styles.stepper}>
                <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.stepBtn}>
                  <Minus size={16} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.stepBtn}>
                  <Plus size={16} color="#0f172a" />
                </TouchableOpacity>
             </View>
          </View>

          <View style={styles.divider} />
          
          <View style={styles.featureRow}>
             <View style={styles.featureItem}>
                <ShieldCheck size={18} color="#10b981" />
                <Text style={styles.featureText}>Quality Assured</Text>
             </View>
             <View style={styles.featureItem}>
                <Clock size={18} color="#2563eb" />
                <Text style={styles.featureText}>Delivered in 30 mins</Text>
             </View>
          </View>

          <Text style={styles.sectionTitle}>About this product</Text>
          <Text style={styles.description}>
            {product.description || "This curated product is chosen for its quality and durability. Experience the best in class service from ShopNish."}
          </Text>
        </View>
      </ScrollView>

      {/* 4. Floating Action Footer (The Best Part) */}
      <View style={styles.footerContainer}>
        <View style={styles.footer}>
          <View style={styles.footerPrice}>
              <Text style={styles.footerLabel}>Total Amount</Text>
              <Text style={styles.totalPriceText}>₹{(product.price * quantity).toLocaleString()}</Text>
          </View>
          
          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={[styles.addBtn, cartMutation.isPending && { opacity: 0.7 }]} 
              onPress={() => cartMutation.mutate()}
            >
              {cartMutation.isPending ? <ActivityIndicator color="#2563eb" size="small" /> : <ShoppingCart color="#2563eb" size={20} />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.buyBtn} 
              onPress={() => navigation.navigate('CheckoutDirect', { item: { ...product, quantity } })}
            >
              <Text style={styles.buyText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerButtons: { 
    position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 
  },
  blurIcon: { 
    width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.85)', 
    borderRadius: 14, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4
  },
  imageWrapper: { width: width, height: height * 0.45, position: 'relative' },
  mainImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  discountBadge: { position: 'absolute', bottom: 60, left: 20, backgroundColor: '#f43f5e', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  discountText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  
  priceInfo: {
    flex: 1,
  },
  
  
  contentCard: { 
    marginTop: -30, backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36,
    padding: 24, flex: 1
  },
  handle: { width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 10, alignSelf: 'center', marginBottom: 24 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tag: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  tagText: { color: '#475569', fontSize: 11, fontWeight: '800' },
  ratingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 4, borderRadius: 8, borderWidth: 1, borderColor: '#f1f5f9' },
  ratingText: { marginLeft: 4, fontSize: 13, fontWeight: '800', color: '#0f172a' },
  reviewCount: { marginLeft: 4, fontSize: 12, color: '#94a3b8' },
  
  name: { fontSize: 24, fontWeight: '900', color: '#0f172a', lineHeight: 32 },
  brand: { fontSize: 14, color: '#2563eb', marginTop: 4, fontWeight: '700' },

  priceContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  currency: { fontSize: 18, fontWeight: '900', color: '#2563eb', marginRight: 2 },
  price: { fontSize: 32, fontWeight: '900', color: '#2563eb' },
  oldPrice: { fontSize: 16, color: '#94a3b8', textDecorationLine: 'line-through', marginLeft: 8 },
  taxLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
  
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 16, padding: 6, borderWidth: 1, borderColor: '#f1f5f9' },
  stepBtn: { width: 34, height: 34, backgroundColor: '#fff', borderRadius: 10, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  quantityText: { fontSize: 16, fontWeight: '800', marginHorizontal: 14, color: '#0f172a' },
  
  divider: { height: 1.5, backgroundColor: '#f8fafc', marginVertical: 24 },
  featureRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  featureItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f8fafc', padding: 12, borderRadius: 16 },
  featureText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  description: { fontSize: 15, color: '#64748b', lineHeight: 24 },

  // --- FOOTER STYLES ---
  footerContainer: { position: 'absolute', bottom: 0, width: '100%', paddingBottom: Platform.OS === 'ios' ? 34 : 20, paddingHorizontal: 20, backgroundColor: 'transparent' },
  footer: { 
    flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 15,
    borderWidth: 1, borderColor: '#f1f5f9'
  },
  footerPrice: { flex: 1 },
  footerLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  totalPriceText: { fontSize: 22, fontWeight: '900', color: '#0f172a' },
  buttonGroup: { flexDirection: 'row', gap: 10 },
  addBtn: { width: 54, height: 54, borderRadius: 16, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#dbeafe' },
  buyBtn: { paddingHorizontal: 28, height: 54, borderRadius: 16, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center' },
  buyText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});
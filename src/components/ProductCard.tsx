import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Plus, Minus, Heart, Truck } from 'lucide-react-native';

interface ProductCardProps {
  item: any;
  width: number;
  quantity: number;
  onAdd: (item: any) => void;
  onIncrease: (item: any) => void;
  onDecrease: (item: any) => void;
  onPress: () => void;
  showSeller?: boolean;
  showWishlist?: boolean;
  compact?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  item,
  width,
  quantity,
  onAdd,
  onIncrease,
  onDecrease,
  onPress,
  showSeller = true,
  showWishlist = true,
  compact = false,
}) => {
  // Price Engine
  const price = Number(item.price || 0);
  const mrp = Number(item.mrp || item.originalPrice || price);
  const hasDiscount = mrp > price;
  const discountPercent = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const stock = item.stock || 0;

  return (
    <TouchableOpacity style={[styles.card, { width: width }]} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.imageWrapper, { height: compact ? 95 : 130 }]}>
        <Image source={{ uri: item.image || "https://via.placeholder.com/150" }} style={styles.image} />
        
        {/* Badges */}
        {item.discountText ? (
          <View style={styles.badge}><Text style={styles.badgeText}>{item.discountText}</Text></View>
        ) : item.hasMultipleVariants && (
          <View style={styles.variantBadge}><Text style={styles.variantText}>{item.variants?.length} Sizes</Text></View>
        )}
        
        {showWishlist && (
          <TouchableOpacity style={styles.wishlist}><Heart size={18} color="#64748b" /></TouchableOpacity>
        )}
      </View>

      <View style={styles.info}>
        {showSeller && <Text style={styles.sellerName}>{item.seller?.businessName || "Verified Shop"}</Text>}
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        
        {/* Rating */}
        <View style={styles.ratingRow}>
          <Text style={styles.rating}>⭐ {item.rating || "4.6"}</Text>
          <Text style={styles.ratingCount}>({item.reviewCount || 0})</Text>
        </View>

        {/* Price Engine */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{price}{item.hasMultipleVariants ? '+' : ''}</Text>
          {hasDiscount && <Text style={styles.mrp}>₹{mrp}</Text>}
        </View>
        
        {/* Delivery Time */}
        <View style={styles.deliveryRow}>
          <Truck size={11} color="#16a34a"/>
          <Text style={styles.deliveryText}>{item.estimatedDeliveryTime || "15-20 min"}</Text>
        </View>

        {/* Stock Warning */}
        {stock > 0 && stock < 5 && <Text style={styles.stockWarning}>Only {stock} Left</Text>}

        {/* Quantity Controls */}
        {stock > 0 ? (
          <View style={styles.actionRow}>
            {quantity === 0 ? (
              <TouchableOpacity style={styles.addBtn} onPress={() => onAdd(item)}><Text style={styles.addBtnText}>ADD</Text></TouchableOpacity>
            ) : (
              <View style={styles.stepper}>
                <TouchableOpacity onPress={() => onDecrease(item)}><Minus size={16}/></TouchableOpacity>
                <Text style={styles.qty}>{quantity}</Text>
                <TouchableOpacity onPress={() => onIncrease(item)}><Plus size={16}/></TouchableOpacity>
              </View>
            )}
          </View>
        ) : <Text style={styles.outOfStock}>Out of Stock</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
  backgroundColor: '#fff',
  borderRadius: 16,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '#f1f5f9',
  margin: 0,
},
  imageWrapper: { width: '100%', backgroundColor: '#f8fafc' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  badge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#fee2e2', paddingHorizontal: 6, borderRadius: 6 },
  badgeText: { fontSize: 9, color: '#991b1b', fontWeight: 'bold' },
  variantBadge: { position: 'absolute', bottom: 8, left: 8, backgroundColor: '#ffffffdd', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  variantText: { fontSize: 10, fontWeight: '700' },
  wishlist: { position: 'absolute', top: 8, right: 8, backgroundColor: '#fff', padding: 4, borderRadius: 20 },
  info: { padding: 10 },
  sellerName: { fontSize: 10, color: '#94a3b8' },
  name: { fontSize: 13, fontWeight: '700', marginTop: 2, height: 35 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  rating: { fontSize: 10, fontWeight: '800', color: '#f59e0b' },
  ratingCount: { fontSize: 10, color: '#94a3b8', marginLeft: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  price: { fontSize: 15, fontWeight: '900' },
  mrp: { fontSize: 11, color: '#94a3b8', textDecorationLine: 'line-through', marginLeft: 6 },
  deliveryRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  deliveryText: { fontSize: 10, color: '#16a34a', marginLeft: 4 },
  stockWarning: { fontSize: 10, color: '#dc2626', fontWeight: 'bold', marginTop: 4 },
  actionRow: { marginTop: 10 },
  addBtn: { backgroundColor: '#eff6ff', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  addBtnText: { color: '#2563eb', fontWeight: 'bold' },
  stepper: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f1f5f9', padding: 8, borderRadius: 8 },
  qty: { fontWeight: 'bold' },
  outOfStock: { fontSize: 11, color: '#dc2626', fontWeight: 'bold', marginTop: 10, textAlign: 'center' }
});

export default ProductCard;
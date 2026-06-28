import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, LayoutChangeEvent} from 'react-native';
import { useNavigation} from '@react-navigation/native';
import { useCart } from '../context/CartContext'; 
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: any[];
  numColumns?: number;
  showSeller?: boolean;
  compact?: boolean;
}
const { width } = Dimensions.get('window');

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  numColumns = 3,
  showSeller = true,
  compact = false 
}) => {
  const navigation = useNavigation<any>();
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const [gridWidth, setGridWidth] = useState(width);
  // Grid math
  const gap = 6;
  const padding = 12;
  // 🎯 इसे बदलें:
const cardWidth = Math.floor((gridWidth - padding - (numColumns - 1) * gap) / numColumns) - 1;

  return (
   <View
   style={styles.grid}
   onLayout={(e: LayoutChangeEvent)=>{
      setGridWidth(e.nativeEvent.layout.width);
   }}
>
      {products.map((item) => {

        // 1. Cart item check
        const cartItem = cart.find((c: any) => c.productId === item.id);
        const qty = cartItem ? cartItem.quantity : 0;

        // 2. ID extraction
        const sellerId = item.sellerId || item.seller?.id;
        const variantId = item.variantId || (item.variants && item.variants.length > 0 ? item.variants[0].id : null);

        return (
          <ProductCard
            key={item.id}
            item={item}
            width={cardWidth-0.5}
            quantity={qty}
            compact={compact}
            showSeller={showSeller}
            
            // 3. Smart Logic Handlers
            onAdd={(product) => addToCart(product, sellerId, variantId)}
            onIncrease={() => {
              if (!cartItem) return;
              updateQuantity(cartItem.id, cartItem.quantity + 1);
            }}
            onDecrease={() => {
              if (!cartItem) return;
              if (cartItem.quantity > 1) {
                updateQuantity(cartItem.id, cartItem.quantity - 1);
              } else {
                removeFromCart(cartItem.id);
              }
            }}
            onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
 grid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  paddingHorizontal: 6,
  paddingVertical: 6,
  gap: 6,
  justifyContent: 'flex-start',
},
});

export default ProductGrid;
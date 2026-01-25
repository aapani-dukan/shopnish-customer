 import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Sparkles } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface Product {
  id: string | number;
  _id?: string | number;
  name: string;
  price: number;
  image: string;
  seller?: { businessName: string };
}

interface TrendingSectionProps {
  products: Product[];
  numColumns?: number; // 2 or 3
}

const TrendingSection: React.FC<TrendingSectionProps> = ({ products, numColumns = 3 }) => {
  const navigation = useNavigation<any>();

  if (!products || products.length === 0) return null;

  // Dynamic Card Width Calculation
  // 32 = total horizontal padding (16 left + 16 right)
  // (numColumns - 1) * 10 = total gap between cards
  const dynamicCardWidth = (width - 32 - (numColumns - 1) * 10) / numColumns;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Sparkles size={18} color="#f59e0b" fill="#f59e0b" />
          <Text style={styles.title}>Trending Nearby</Text>
        </View>
        <TouchableOpacity 
           onPress={() => navigation.navigate('Search')}
           hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.seeAllBtn}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Grid Layout */}
      <View style={[styles.grid, { gap: 10 }]}>
        {products.slice(0, 9).map((item) => (
          <TouchableOpacity
            key={item.id || item._id}
            style={[styles.card, { width: dynamicCardWidth }]}
            onPress={() => navigation.navigate('ProductDetails', { productId: item.id || item._id })}
            activeOpacity={0.9}
          >
            {/* Image Container */}
            <View style={[styles.imageWrapper, { height: numColumns === 3 ? 110 : 150 }]}>
              <Image source={{ uri: item.image }} style={styles.image} />
              {numColumns === 2 && (
                <View style={styles.trendingBadge}>
                  <Text style={styles.badgeText}>🔥 Trending</Text>
                </View>
              )}
            </View>

            {/* Content Area */}
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.seller} numberOfLines={1}>
                {item.seller?.businessName || 'Verified Shop'}
              </Text>
              <View style={styles.priceRow}>
                 <Text style={styles.currency}>₹</Text>
                 <Text style={styles.price}>{item.price}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default TrendingSection;

const styles = StyleSheet.create({
  container: { marginTop: 10, marginBottom: 20 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    marginBottom: 12 
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 18, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 },
  seeAllBtn: { color: '#2563eb', fontWeight: '800', fontSize: 12, backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: 16,
  },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 18, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
    // Minimal shadow for 3-column clean look
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  imageWrapper: { 
    width: '100%', 
    backgroundColor: '#f8fafc' 
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  trendingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { fontSize: 8, fontWeight: '900', color: '#0f172a' },
  
  info: { padding: 8 },
  name: { fontSize: 12, fontWeight: '700', color: '#1e293b' },
  seller: { fontSize: 10, color: '#94a3b8', marginTop: 1, fontWeight: '500' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4, gap: 1 },
  currency: { fontSize: 10, fontWeight: '900', color: '#2563eb' },
  price: { fontSize: 15, fontWeight: '900', color: '#2563eb' },
});
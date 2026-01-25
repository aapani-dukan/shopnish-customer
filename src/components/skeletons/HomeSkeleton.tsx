import React from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';

const { width } = Dimensions.get('window');

const HomeSkeleton = () => {
  const opacity = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const ShimmerBlock = ({ style }: { style: any }) => (
    <Animated.View style={[style, { opacity, backgroundColor: '#f1f5f9' }]} />
  );

  return (
    <View style={styles.container}>
      {/* Header Placeholder */}
      <View style={styles.header}>
        <ShimmerBlock style={styles.avatar} />
        <ShimmerBlock style={styles.addressLine} />
        <ShimmerBlock style={styles.cartIcon} />
      </View>

      {/* Search Bar Placeholder */}
      <ShimmerBlock style={styles.searchBar} />

      {/* Categories Placeholder */}
      <View style={styles.row}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={{ alignItems: 'center', marginRight: 15 }}>
            <ShimmerBlock style={styles.catCircle} />
            <ShimmerBlock style={styles.catText} />
          </View>
        ))}
      </View>

      {/* Banner Placeholder */}
      <ShimmerBlock style={styles.banner} />

      {/* Products Grid Placeholder */}
      <View style={styles.grid}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.card}>
            <ShimmerBlock style={styles.img} />
            <ShimmerBlock style={styles.name} />
            <ShimmerBlock style={styles.price} />
          </View>
        ))}
      </View>
    </View>
  );
};

export default HomeSkeleton;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 40, height: 40, borderRadius: 12 },
  addressLine: { height: 20, width: '60%', marginLeft: 10, borderRadius: 6 },
  cartIcon: { width: 40, height: 40, borderRadius: 12, marginLeft: 'auto' },
  searchBar: { height: 50, borderRadius: 16, marginBottom: 20 },
  row: { flexDirection: 'row', marginBottom: 30 },
  catCircle: { width: 60, height: 60, borderRadius: 30, marginBottom: 8 },
  catText: { height: 10, width: 40, borderRadius: 4 },
  banner: { height: 180, borderRadius: 24, marginBottom: 30 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: (width / 2) - 30, marginBottom: 20 },
  img: { height: 150, borderRadius: 20, marginBottom: 10 },
  name: { height: 15, width: '80%', borderRadius: 4, marginBottom: 6 },
  price: { height: 15, width: '40%', borderRadius: 4 },
});
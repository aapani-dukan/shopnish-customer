// screens/Home/BannerCarousel.tsx
import React, { useState, useRef } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface BannerItem {
  id: string | number;
  image: string;
  title?: string;
  actionType?: 'CATEGORY' | 'PRODUCT' | 'SEARCH';
  actionValue?: string | number;
}

interface BannerCarouselProps {
  banners: BannerItem[];
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners }) => {
  const navigation = useNavigation<any>();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleBannerPress = (item: BannerItem) => {
    if (!item.actionValue) return;

    switch (item.actionType) {
      case 'CATEGORY':
        navigation.navigate('CategoryDetails', { catId: item.actionValue });
        break;
      case 'PRODUCT':
        navigation.navigate('ProductDetails', { productId: item.actionValue });
        break;
      case 'SEARCH':
        navigation.navigate('Search', { initialQuery: item.actionValue });
        break;
      default:
        console.log("Unknown banner action type");
    }
  };

  const onScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / (width - 40));
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        snapToInterval={width - 30} // बैनर की चौड़ाई + मार्जिन
  decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {banners.map((item, index) => (
          <TouchableOpacity
            key={item.id || `banner-${index}`}
            style={styles.bannerWrapper}
            onPress={() => handleBannerPress(item)}
            activeOpacity={0.9}
          >
            <Image source={{ uri: item.image }} style={styles.bannerImage} />
            {item.title && (
              <View style={styles.overlay}>
                <Text style={styles.bannerText}>{item.title}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {banners.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              activeIndex === i ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  scrollContainer: { paddingHorizontal: 20 },
  bannerWrapper: {
    width: width - 40,
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: '#f1f5f9',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  bannerText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  pagination: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  activeDot: { backgroundColor: '#2563eb' },
  inactiveDot: { backgroundColor: '#cbd5e1' },
});

export default BannerCarousel;
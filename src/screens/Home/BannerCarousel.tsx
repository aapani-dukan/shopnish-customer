// screens/Home/BannerCarousel.tsx
import React, { useState, useRef } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Text, ScrollView } from 'react-native';

const { width } = Dimensions.get('window');

// Interface को डेटा के हिसाब से लचीला बनाया
interface BannerItem {
  id?: string | number;
  image: string;
  title?: string;
  productId?: number;
  categoryId?: number;
  deeplink?: string;
}

interface BannerCarouselProps {
  banners: BannerItem[];
  onPress: (banner: any) => void; // HomeScreen से आने वाला फंक्शन
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners, onPress }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / (width - 40));
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        snapToInterval={width - 30}
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
            // ✅ यहाँ बदलाव किया: अब यह सीधा HomeScreen वाले logic को कॉल करेगा
            onPress={() => onPress(item)} 
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

// ... Styles remain the same ...
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
// screens/Home/BannerCarousel.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Text, Animated } from 'react-native';

const { width } = Dimensions.get('window');
const SLIDE_INTERVAL = 4000; // ⏱️ हर 4 सेकंड में बैनर बदलेगा भाई साहब

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
  onPress: (banner: any) => void; // होम स्क्रीन का क्लिक लॉजिक एकदम सुरक्षित भाई
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners, onPress }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current; // धुंधला करने का जादुई एनीमेशन वेरिएबल

  // 🚚 मखमली क्रॉस-फ़ेड ऑटो-प्ले इंजन भाई साहब
  useEffect(() => {
    if (!banners || banners.length <= 1) return;

    const interval = setInterval(() => {
      // 🌟 कड़क सुधार 1: पुराने बैनर को बहुत ही आराम से और धीरे से पूरी तरह गायब (Fade Out) करो भाई
      Animated.timing(fadeAnim, {
        toValue: 0, // पूरा धुंधला (0 मतलब बिल्कुल गायब, जिससे झटका नहीं लगेगा)
        duration: 800, // ⏱️ स्पीड धीमी की: अब 0.8 सेकंड में धीरे-धीरे धुंधला होगा
        useNativeDriver: true,
      }).start(() => {
        // बैकग्राउंड में चुपके से इंडेक्स बदल दो भाई साहब
        setActiveIndex((prevIndex) => {
          const nextIndex = prevIndex + 1 >= banners.length ? 0 : prevIndex + 1;
          
          // 🌟 कड़क सुधार 2: नए बैनर को और भी प्यारे तरीके से धीरे-धीरे स्क्रीन पर उभारो (Fade In)
          Animated.timing(fadeAnim, {
            toValue: 1, // पूरा साफ़ और चमकदार
            duration: 900, // ⏱️ स्पीड धीमी की: अब 0.9 सेकंड में धीरे-धीरे खुलकर सामने आएगा
            useNativeDriver: true,
          }).start();

          return nextIndex;
        });
      });
    }, SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, [activeIndex, banners]);

  if (!banners || banners.length === 0) return null;

  const currentBanner = banners[activeIndex];

  return (
    <View style={styles.container}>
      {/* एनिमेटेड डिब्बा: बिना किसी बॉक्स के, पूरी स्क्रीन पर फैलने वाला लेआउट भाई साहब */}
      <Animated.View style={[styles.animationWrapper, { opacity: fadeAnim }]}>
        <TouchableOpacity
          key={currentBanner.id || `banner-${activeIndex}`}
          style={styles.bannerWrapper}
          onPress={() => onPress(currentBanner)} 
          activeOpacity={0.95}
        >
          <Image source={{ uri: currentBanner.image }} style={styles.bannerImage} />
          {currentBanner.title && (
            <View style={styles.overlay}>
              <Text style={styles.bannerText}>{currentBanner.title}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  // 🌟 कड़क सुधार 3: मार्जिन और पैडिंग को विदा किया ताकि बैनर बॉक्स से आज़ाद होकर पूरी स्क्रीन पर फैले भाई साहब
  container: { 
    marginBottom: 20, 
    width: width, // पूरी स्क्रीन की चौड़ाई
    alignItems: 'center' 
  },
  animationWrapper: {
    width: width, // पूरी स्क्रीन की चौड़ाई (कोई बॉक्स मार्जिन नहीं भाई)
    height: 200,  // फुल स्क्रीन लुक में हाइट को थोड़ा सा बढ़ा दिया ताकि शानदार लगे
    overflow: 'hidden',
  },
  bannerWrapper: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f1f5f9',
  },
  bannerImage: { 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover' // पूरी स्क्रीन पर इमेज एकदम परफेक्ट फिट बैठेगी भाई
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  bannerText: { color: '#fff', fontSize: 18, fontWeight: '900', paddingHorizontal: 20 },
});

export default BannerCarousel;
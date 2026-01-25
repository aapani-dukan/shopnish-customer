import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Platform } from 'react-native';


interface Category {
  id: string | number;
  name: string;
  icon?: string;
  image?: string;
  badge?: string; // ✅ ये लाइन एरर खत्म कर देगी (जैसे: "New", "50% Off")
}

interface Props {
  categories: Category[];
  selectedCategoryId: number | string | null;
  onSelectCategory: (id: string | number) => void;
}
const CategoryScroller: React.FC<Props> = ({ categories, selectedCategoryId, onSelectCategory }) => {
  return (
    <View style={styles.stickyWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;

          return (
            <TouchableOpacity
              key={cat.id}
              style={styles.catItemWrapper}
              onPress={() => onSelectCategory(cat.id)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.catCircle, 
                isSelected && styles.selectedCatCircle
              ]}>
                {cat.icon ? (
                  <Text style={[styles.emoji, isSelected && { transform: [{ scale: 1.1 }] }]}>
                    {cat.icon}
                  </Text>
                ) : (
                  <Image source={{ uri: cat.image }} style={styles.catImage} />
                )}

                {cat.badge && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{cat.badge}</Text>
                  </View>
                )}
              </View>
              <Text 
                style={[styles.catText, isSelected && styles.selectedCatText]} 
                numberOfLines={1}
              >
                {cat.name}
              </Text>
              {/* Selected Indicator Line - Amazon style */}
              {isSelected && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default CategoryScroller;

const styles = StyleSheet.create({
  stickyWrapper: {
    backgroundColor: '#fff', // Sticky होने पर पीछे का डेटा छुपाने के लिए
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  scrollContainer: { 
    paddingHorizontal: 16, 
    paddingTop: 10,
    paddingBottom: 14 
  },
  catItemWrapper: { 
    alignItems: 'center', 
    marginRight: 20,
    position: 'relative'
  },
  catCircle: {
    width: 60, // थोड़ा बड़ा साइज प्रीमियम लगता है
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 2 }
    }),
  },
  selectedCatCircle: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
    elevation: 4,
    shadowColor: '#2563eb',
    shadowOpacity: 0.2,
  },
  emoji: { 
    fontSize: 28, 
    textAlign: 'center',
    // इमोजी को थोड़ा 'Depth' देने के लिए
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1
  },
  catImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  catText: { 
    fontSize: 11, 
    fontWeight: '600', 
    marginTop: 6, 
    color: '#64748b',
    letterSpacing: 0.2
  },
  selectedCatText: { 
    color: '#1e293b', 
    fontWeight: '800' 
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 20,
    height: 3,
    backgroundColor: '#2563eb',
    borderRadius: 2,
  },
  badgeContainer: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#f43f5e',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: { color: '#fff', fontSize: 8, fontWeight: '900' },
});
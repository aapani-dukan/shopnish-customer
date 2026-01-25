import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import LocationHeader from '../../components/LocationHeader';

interface HomeHeaderProps {
  cartCount: number;
  onPressLocation: () => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ cartCount, onPressLocation }) => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.mainHeader}>
      {/* Location Section */}
      <TouchableOpacity
        style={styles.locationContainer}
        activeOpacity={0.6}
        onPress={onPressLocation}
        // बड़ी टच एरिया के लिए ताकि क्लिक करने में आसानी हो
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <LocationHeader />
      </TouchableOpacity>

      {/* Cart Section */}
      <TouchableOpacity
        style={styles.cartBtn}
        onPress={() => navigation.navigate('Cart')}
        activeOpacity={0.8}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <ShoppingBag color="#1e293b" size={24} strokeWidth={2} />
        {cartCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16, // Zomato/Amazon standard padding
    paddingVertical: 10,
    backgroundColor: '#fff',
    // Border को बहुत ही हल्का रखा है ताकि UI 'Modern' लगे
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
    ...Platform.select({
      android: { elevation: 0 }, // अभी Elevation 0 रखेंगे क्योंकि ये स्क्रॉल होकर गायब होगा
      ios: { zIndex: 10 },
    }),
  },
  locationContainer: { 
    flex: 1, 
    marginRight: 15,
    justifyContent: 'center'
  },
  cartBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#2563eb', // Brand color
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
    lineHeight: 11,
  },
});
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Search } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useLocation } from '../../context/LocationContext'; // 👈 अपना लोकेशन हुक इम्पोर्ट करें

const SearchBar: React.FC = () => {
  const navigation = useNavigation<any>();
  const { currentLocation } = useLocation(); // 👈 लोकेशन डेटा निकालें

  const handleSearchPress = () => {
    navigation.navigate('Search', {
      // ✅ सर्च स्क्रीन को ये पैरामीटर्स भेजना "Compulsory" है
      pincode: currentLocation?.pincode,
      lat: currentLocation?.latitude,
      lng: currentLocation?.longitude,
    });
  };

  return (
    <View style={styles.stickyContainer}>
      <TouchableOpacity
        style={styles.searchBar}
        onPress={handleSearchPress} // 👈 यहाँ नया हैंडलर लगाएं
        activeOpacity={0.9}
      >
        <Search size={20} color="#64748b" strokeWidth={2.5} />
        <Text style={styles.searchText}>Search products or shops...</Text>
        {/* 2. एक छोटा सा विजुअल 'Mic' या 'Filter' का हिंट भी दे सकते हैं */}
        <View style={styles.divider} />
        <Text style={styles.searchHint}>Find</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  stickyContainer: {
    backgroundColor: '#fff', // चिपके रहने पर पीछे का कंटेंट छुपाने के लिए
    paddingVertical: 8,
    // Android के लिए हल्की परछाई
    ...Platform.select({
      android: { elevation: 3 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      }
    }),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9', // थोड़ा डार्क ग्रे ताकि सफ़ेद बैकग्राउंड पर चमके
    marginHorizontal: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchText: {
    flex: 1,
    marginLeft: 10,
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 10,
  },
  searchHint: {
    color: '#2563eb', // Brand Color
    fontSize: 12,
    fontWeight: '700',
  }
});
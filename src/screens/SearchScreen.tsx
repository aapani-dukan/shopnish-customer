import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, ScrollView, 
  TouchableOpacity, Image, Dimensions 
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Mock Data for UI Testing
const TRENDING_SEARCHES = ['Fresh Mango', 'Organic Milk', 'Brown Bread', 'Amul Butter', 'Spices'];
const CATEGORIES = [
  { id: 1, name: 'Fruits', icon: '🍎' },
  { id: 2, name: 'Dairy', icon: '🥛' },
  { id: 3, name: 'Bakery', icon: '🍞' },
  { id: 4, name: 'Snacks', icon: '🍿' },
];

export default function SearchScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      {/* 1. Header & Search Bar */}
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, stores, or categories..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 2. Trending Searches (Chips) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Searches</Text>
          <View style={styles.chipContainer}>
            {TRENDING_SEARCHES.map((item) => (
              <TouchableOpacity key={item} style={styles.chip}>
                <Text style={styles.chipText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 3. Browse by Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse Categories</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryCard}>
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={styles.categoryName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 4. Empty State (Jab kuch search na ho) */}
        {!searchQuery && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Feather name="shopping-bag" size={40} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyText}>Find the best items in ShopNish</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '900', color: '#1E293B', marginBottom: 20 },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F1F5F9', 
    paddingHorizontal: 15, 
    height: 55, 
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1E293B', fontWeight: '500' },
  section: { paddingHorizontal: 20, marginTop: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 15 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    marginRight: 10, 
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  chipText: { color: '#64748B', fontWeight: '600', fontSize: 14 },
  categoryGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  categoryCard: { 
    width: (width - 60) / 4, 
    alignItems: 'center', 
    backgroundColor: '#F8FAFC', 
    paddingVertical: 15, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  categoryIcon: { fontSize: 24, marginBottom: 8 },
  categoryName: { fontSize: 12, fontWeight: '700', color: '#475569' },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyIconCircle: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: '#F8FAFC', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 15
  },
  emptyText: { fontSize: 16, color: '#94A3B8', fontWeight: '600' }
});
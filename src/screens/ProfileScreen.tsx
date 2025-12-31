import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useAuth } from '../context/AuthContext'; // Aapka Auth hook
import { logout } from '../lib/firebase'; // Aapka Logout function

export default function ProfileScreen({ navigation }: any) {
  const { user } = useAuth(); // Firebase se current user lo

  // 1. Backend se User Stats mangwao (Orders count, savings etc.)
  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ['/api/user/stats'], 
    enabled: !!user, // Jab user login ho tabhi fetch kare
  });

  // Logout Handler
  const handleLogout = () => {
    Alert.alert("Logout", "Kya aap sach mein logout karna chahte hain?", [
      { text: "Nahi", style: "cancel" },
      { text: "Haan", style: "destructive", onPress: async () => await logout() }
    ]);
  };

  const ProfileOption = ({ icon, title, subtitle, onPress, color = "#1E293B", showBadge = false }: any) => (
    <TouchableOpacity style={styles.optionRow} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color + '10' }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <View style={styles.optionTextContainer}>
        <Text style={styles.optionTitle}>{title}</Text>
        {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
      </View>
      {showBadge && <View style={styles.badge}><Text style={styles.badgeText}>2</Text></View>}
      <Feather name="chevron-right" size={18} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Account</Text>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
          <Feather name="edit-3" size={20} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 2. Dynamic User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ 
                uri: (user as any)?.photoURL || `https://ui-avatars.com/api/?name=${(user as any)?.displayName || 'User'}&background=2563eb&color=fff` 
              }} 
              style={styles.avatar} 
            />
            <View style={styles.onlineStatus} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{(user as any)?.displayName || 'ShopNish User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'N/A'}</Text>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{stats?.membership || 'SILVER MEMBER'}</Text>
            </View>
          </View>
        </View>

        {/* 3. Dynamic Stats Section */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            {isLoading ? <ActivityIndicator size="small" color="#2563eb" /> : (
              <Text style={styles.statValue}>{stats?.totalOrders || '0'}</Text>
            )}
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            {isLoading ? <ActivityIndicator size="small" color="#2563eb" /> : (
              <Text style={styles.statValue}>₹{stats?.totalSavings || '0'}</Text>
            )}
            <Text style={styles.statLabel}>Saved</Text>
          </View>
        </View>

        {/* 4. Menu Sections */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuLabel}>Account Settings</Text>
          <ProfileOption 
            icon="map-pin" 
            title="Saved Addresses" 
            subtitle={stats?.addressSummary || "Add your address"} 
            color="#2563eb" 
            onPress={() => navigation.navigate('Addresses')}
          />
          <ProfileOption 
            icon="credit-card" 
            title="Payment Methods" 
            subtitle="UPI, Saved Cards" 
            color="#7c3aed" 
          />
          <ProfileOption 
            icon="bell" 
            title="Notifications" 
            color="#f59e0b" 
            showBadge={true} 
          />
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.menuLabel}>Support & Info</Text>
          <ProfileOption icon="help-circle" title="Help Center" color="#10b981" />
          <ProfileOption icon="shield" title="Privacy Policy" color="#64748b" />
          <ProfileOption icon="info" title="About ShopNish" color="#64748b" />
        </View>

        {/* 5. Real Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Feather name="log-out" size={20} color="#EF4444" style={{ marginRight: 10 }} />
          <Text style={styles.logoutText}>Logout from Account</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>ShopNish v2.4.0 (Alpha)</Text>
      </ScrollView>
    </View>
  );
}

// ... styles same rahenge (vahi purane) ...

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 60, 
    paddingBottom: 20, 
    backgroundColor: '#fff' 
  },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#1E293B' },
  editBtn: { padding: 8, backgroundColor: '#EFF6FF', borderRadius: 12 },
  userCard: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    margin: 20, 
    padding: 20, 
    borderRadius: 24, 
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 2
  },
  avatarContainer: { position: 'relative' },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#E2E8F0' },
  onlineStatus: { 
    position: 'absolute', 
    bottom: 2, 
    right: 2, 
    width: 16, 
    height: 16, 
    borderRadius: 8, 
    backgroundColor: '#22c55e', 
    borderWidth: 3, 
    borderColor: '#fff' 
  },
  userInfo: { marginLeft: 20, flex: 1 },
  userName: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
  userEmail: { fontSize: 13, color: '#64748B', marginTop: 2 },
  tag: { backgroundColor: '#F59E0B', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 8 },
  tagText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 20, marginBottom: 25 },
  statBox: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  statLabel: { fontSize: 12, color: '#64748B', marginTop: 4 },
  statDivider: { width: 1, height: '80%', backgroundColor: '#E2E8F0' },
  menuContainer: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 20, borderRadius: 24, paddingVertical: 10, paddingHorizontal: 5 },
  menuLabel: { fontSize: 14, fontWeight: '800', color: '#94A3B8', marginLeft: 15, marginBottom: 10, marginTop: 5, textTransform: 'uppercase' },
  optionRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  iconContainer: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  optionTextContainer: { flex: 1, marginLeft: 15 },
  optionTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  optionSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  badge: { backgroundColor: '#EF4444', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#FEF2F2', 
    marginHorizontal: 20, 
    paddingVertical: 16, 
    borderRadius: 18, 
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FEE2E2'
  },
  logoutText: { color: '#EF4444', fontWeight: '800', fontSize: 15 },
  versionText: { textAlign: 'center', color: '#CBD5E1', fontSize: 12, marginTop: 20 }
});
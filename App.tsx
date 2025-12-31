import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { onAuthStateChange } from './src/lib/firebase';
import { LocationProvider } from './src/context/LocationContext';
import { CartProvider } from './src/context/CartContext'; 
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator'; // Hamara naya navigator
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/lib/queryClient';
export default function App() {
  const [user, setUser] = useState<any>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((u) => {
      setUser(u);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, [initializing]);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SafeAreaProvider>
        <CartProvider> 
          <LocationProvider>
            {/* ✅ Sirf ek line! Saara navigation ab iske andar handle hoga */}
            <AppNavigator /> 
          </LocationProvider>
        </CartProvider>
      </SafeAreaProvider>
    </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
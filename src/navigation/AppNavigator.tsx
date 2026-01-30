import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

// Context / Auth
import { useAuth } from '../context/AuthContext';

// Screens
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import CheckoutDirectScreen from '../screens/CheckoutDirectScreen';
import OrderSuccessScreen from '../screens/OrderSuccessScreen';
import TrackOrderScreen from '../screens/TrackOrderScreen';
import AddressesScreen from '../screens/AddressesScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import MapPickerScreen from '../screens/MapPickerScreen';
import CategoryDetailsScreen from '../screens/CategoryDetailsScreen';
import ShopDetailsScreen from '../screens/Home/ShopDetailsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ----- Bottom Tabs -----
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Search') iconName = 'search';
          else if (route.name === 'My Orders') iconName = 'list'; // Feather me package nahi hai
          else if (route.name === 'Profile') iconName = 'user';
          return <Feather name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: { height: 60, paddingBottom: 10 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="My Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ----- Main Stack -----
export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />

            {/* Product Screens */}
            <Stack.Screen
              name="ProductDetails"
              component={ProductDetailsScreen}
              options={{
    headerShown: true,
    headerBackTitle: '',   // ✅ correct for v6
  }}
            />
            <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: true, title: 'Cart' }} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: true, title: 'Checkout' }} />
            <Stack.Screen name="CheckoutDirect" component={CheckoutDirectScreen} options={{ headerShown: true, title: 'Checkout' }} />
            <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} options={{ headerShown: true, title: 'Order Success' }} />

            {/* Orders */}
            <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ headerShown: true, title: 'Order Details' }} />
            <Stack.Screen name="TrackOrder" component={TrackOrderScreen} options={{ headerShown: true, title: 'Live Tracking' }} />

            {/* Addresses */}
            <Stack.Screen name="Addresses" component={AddressesScreen} options={{ headerShown: true, title: 'Manage Addresses' }} />
            <Stack.Screen name="MapPicker" component={MapPickerScreen} options={{ headerShown: true, title: 'Pick Location' }} />

            {/* Category / Shop Screens */}
            <Stack.Screen name="CategoryDetails" component={CategoryDetailsScreen} options={{ headerShown: true, title: 'Category' }} />
            <Stack.Screen name="ShopDetails" component={ShopDetailsScreen} options={{ headerShown: true, title: 'Shop Details' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
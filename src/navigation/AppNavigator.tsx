import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons'; 

// 🛑 Context/Auth import (Aapka path ye ho sakta hai)
import { useAuth } from '../context/AuthContext'; 

// Screens Imports
import AuthScreen from '../screens/AuthScreen'; // Auth screen zaroori hai
import HomeScreen from '../screens/HomeScreen';
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
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 1. Bottom Tab Navigation
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Search') iconName = 'search';
          else if (route.name === 'My Orders') iconName = 'package';
          else if (route.name === 'Profile') iconName = 'user';
          return <Feather name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: { height: 60, paddingBottom: 10 } // Premium look ke liye thodi height
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="My Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// 2. Main Stack (Conditional Rendering ke saath)
export default function AppNavigator() {
  const { user } = useAuth(); // User ka status check karein

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // 🚪 Agar login nahi hai toh sirf Auth dikhao
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          // 🏠 Agar login hai toh poori app khol do
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="CheckoutDirect" component={CheckoutDirectScreen} />
            <Stack.Screen name="Addresses" component={AddressesScreen} />
            <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
            <Stack.Screen name="MapPicker" component={MapPickerScreen} />
            <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
            <Stack.Screen 
              name="TrackOrder" 
              component={TrackOrderScreen} 
              options={{ headerShown: true, title: 'Live Tracking' }}
            />
            <Stack.Screen name="CategoryDetails" component={CategoryDetailsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
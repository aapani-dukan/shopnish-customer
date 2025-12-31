import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

// ✅ Interface update ki gayi (lat/lng -> latitude/longitude)
export interface ProcessedLocation {
  latitude: number;
  longitude: number;
  address: string;
  pincode: string;
  inServiceArea: boolean;
  city?: string;
}

interface LocationContextType {
  currentLocation: ProcessedLocation | null;
  loadingLocation: boolean;
  fetchCurrentGeolocation: () => Promise<void>;
  updateLocationManually: (latitude: number, longitude: number, address: string, pincode: string) => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<ProcessedLocation | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  const processLocationWithBackend = async (latitude: number, longitude: number) => {
    try {
      // Backend ko latitude/longitude hi chahiye
      const response = await api.post('/api/addresses/process-current-location', {
        latitude,
        longitude
      });
      
      const newLoc: ProcessedLocation = {
        latitude,
        longitude,
        address: response.data.address || "Unknown Address",
        pincode: response.data.pincode || "",
        inServiceArea: response.data.inServiceArea || false,
        city: response.data.city
      };

      setCurrentLocation(newLoc);
      await AsyncStorage.setItem('userLocation', JSON.stringify(newLoc));
      return newLoc;
    } catch (err) {
      console.error("Backend Location Error:", err);
    }
  };

  const fetchCurrentGeolocation = useCallback(async () => {
    setLoadingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert("Location permission deni hogi!");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      await processLocationWithBackend(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingLocation(false);
    }
  }, []);

  const updateLocationManually = async (latitude: number, longitude: number, address: string, pincode: string) => {
    const locData: ProcessedLocation = { 
        latitude, 
        longitude, 
        address, 
        pincode, 
        inServiceArea: true 
    };
    setCurrentLocation(locData);
    await AsyncStorage.setItem('userLocation', JSON.stringify(locData));
  };

  useEffect(() => {
    const loadSaved = async () => {
      const saved = await AsyncStorage.getItem('userLocation');
      if (saved) {
        try {
          setCurrentLocation(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse saved location");
        }
      }
      setLoadingLocation(false);
    };
    loadSaved();
  }, []);

  return (
    <LocationContext.Provider value={{ currentLocation, loadingLocation, fetchCurrentGeolocation, updateLocationManually }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error("LocationProvider missing");
  return context;
};
// AuthContext.tsx (Updated)
import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { User as FirebaseUser, onAuthStateChanged, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth, logout } from '../lib/firebase';
import api from '../services/api';
import { signInWithPhoneNumber } from "firebase/auth";
export interface User {
  id?: string;
  uid?: string;
  email: string | null;
  phoneNumber: string | null; // OTP ke liye phone number add kiya
  name: string | null;
  role: "customer" | "seller" | "admin" | "delivery";
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoadingAuth: boolean;
  isAuthenticated: boolean;

  // ✅ Mobile APK friendly OTP flow
  sendOtp: (phoneNumber: string) => Promise<void>;
  verifyOtp: (otpCode: string) => Promise<void>;

  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // ✅ Sabse bada badlav yahan hai
  const fetchAndSyncBackendUser = useCallback(async (fbUser: FirebaseUser) => {
    try {
      // 1. Firebase se fresh ID Token lein
      const idToken = await fbUser.getIdToken(true);

      // 2. /api/users/login par POST request bhejein (Jo humne Render par banaya hai)
      // Ye naye user ko banayega aur purane user ko fetch karega
      const res = await api.post("/api/users/login", { idToken });
      
      const dbUserData = res.data.user;

      const newUserData: User = {
        uid: fbUser.uid,
        id: dbUserData.id,
        email: dbUserData.email,
        phoneNumber: fbUser.phoneNumber || dbUserData.phone,
        name: dbUserData.firstName ? `${dbUserData.firstName} ${dbUserData.lastName}` : "Customer",
        role: dbUserData.role,
        isAdmin: dbUserData.role === "admin",
      };
      
      setUser(newUserData);
    } catch (e: any) {
      console.error("❌ Backend sync failed:", e.response?.data || e.message);
      // Agar backend mana kar de, toh Firebase se bhi logout kar dein
      setUser(null);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        await fetchAndSyncBackendUser(fbUser);
      } else {
        setUser(null);
        setIsLoadingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [fetchAndSyncBackendUser]);

  // 🔥 OTP Bhejne wala function (Real)
  

const [confirmation, setConfirmation] = useState<any>(null);

const sendOtp = async (phoneNumber: string) => {
  try {
    const result = await signInWithPhoneNumber(auth, phoneNumber);
    setConfirmation(result);
  } catch (err) {
    console.log("❌ SEND OTP ERROR", err);
  }
};

  // 🔥 OTP Verify karke Login karne wala function
  const verifyOtp = async (otpCode: string) => {
  try {
    if (!confirmation) {
      throw new Error("OTP session expired");
    }

    await confirmation.confirm(otpCode.trim());
  } catch (err: any) {
    console.log("❌ VERIFY OTP ERROR", err.code, err.message);
    alert(err.message);
  }
};

  const signOut = async () => {
    await logout();
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    isLoadingAuth,
    isAuthenticated: !!user,
    sendOtp,
    verifyOtp,
    signOut,
  }), [user, isLoadingAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
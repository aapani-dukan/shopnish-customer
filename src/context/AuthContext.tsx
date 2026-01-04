// AuthContext.tsx (Updated)
import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { User as FirebaseUser, onAuthStateChanged, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth, logout } from '../lib/firebase';
import api from '../services/api';

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
  // OTP ke liye naye functions
  sendOtp: (phoneNumber: string, recaptchaVerifier: any) => Promise<string>;
  verifyOtp: (verificationId: string, otpCode: string) => Promise<void>;
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
  const sendOtp = async (phoneNumber: string, recaptchaVerifier: any) => {
    const phoneProvider = new PhoneAuthProvider(auth);
    return await phoneProvider.verifyPhoneNumber(phoneNumber, recaptchaVerifier);
  };

  // 🔥 OTP Verify karke Login karne wala function
  const verifyOtp = async (verificationId: string, otpCode: string) => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otpCode);
      // Firebase login hone par onAuthStateChanged apne aap trigger hoga
      // Aur hamara naya fetchAndSyncBackendUser chal jayega
      await signInWithCredential(auth, credential);
    } catch (error) {
      console.error("❌ OTP Verification Failed:", error);
      throw error;
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
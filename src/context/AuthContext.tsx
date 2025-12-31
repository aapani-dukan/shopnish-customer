import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, signInWithEmail as firebaseSignInWithEmail, signUpWithEmail as firebaseSignUpWithEmail, logout } from '../lib/firebase';
import api from '../services/api'; // Aapka axios instance

// --- Types ---
export interface User {
  id?: string; // Backend DB ID
  uid?: string; // Firebase UID
  email: string | null;
  name: string | null;
  role: "customer" | "seller" | "admin" | "delivery";
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoadingAuth: boolean;
  isAuthenticated: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // ✅ Backend se Sync karne wala function (Exact Web App Logic)
  const fetchAndSyncBackendUser = useCallback(async (fbUser: FirebaseUser) => {
    try {
      const idToken = await fbUser.getIdToken();
      
      // 1. Backend se user data mangwao
      const res = await api.get("/api/users/me");
      const dbUserData = res.data.user || res.data;

      const newUserData: User = {
        uid: fbUser.uid,
        id: dbUserData.id, // 👈 Yahi ID chahiye thi checkout ke liye
        email: fbUser.email,
        name: dbUserData.name || fbUser.displayName,
        role: dbUserData.role || "customer",
        isAdmin: dbUserData.role === "admin",
      };

      setUser(newUserData);
    } catch (e: any) {
      console.error("❌ Backend sync failed:", e.response?.data || e.message);
      // Agar backend par user nahi hai toh initial-login call ho sakta hai (optional)
      setUser(null);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  // ✅ Auth State Change Monitor
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser:any) => {
      if (fbUser) {
        await fetchAndSyncBackendUser(fbUser);
      } else {
        setUser(null);
        setIsLoadingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [fetchAndSyncBackendUser]);

  // ✅ Login Function
  const signInWithEmail = async (email: string, password: string) => {
    setIsLoadingAuth(true);
    try {
      await firebaseSignInWithEmail(email, password);
      // fetchAndSync apne aap useEffect se trigger ho jayega
    } catch (err) {
      setIsLoadingAuth(false);
      throw err;
    }
  };

  // ✅ Logout Function
  const signOut = async () => {
    await logout();
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    isLoadingAuth,
    isAuthenticated: !!user,
    signInWithEmail,
    signOut,
  }), [user, isLoadingAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
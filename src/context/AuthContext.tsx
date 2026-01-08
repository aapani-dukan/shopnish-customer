import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPhoneNumber,
  RecaptchaVerifier, // <-- Zaroori hai
  ConfirmationResult
} from "firebase/auth";

import { auth, logout } from "../lib/firebase";
import api from "../services/api";

/* =======================
   TYPES
======================= */
export interface User {
  id?: string;
  uid?: string;
  email: string | null;
  phoneNumber: string | null;
  name: string | null;
  role: "customer" | "seller" | "admin" | "delivery";
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoadingAuth: boolean;
  isAuthenticated: boolean;
  sendOtp: (phoneNumber: string, elementId: string) => Promise<void>; // elementId added
  verifyOtp: (otpCode: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  // Re-captcha setup function
  const setupRecaptcha = (elementId: string) => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
        size: "invisible",
        callback: () => {
          console.log("Recaptcha resolved");
        }
      });
    }
  };

  const fetchAndSyncBackendUser = useCallback(async (fbUser: FirebaseUser) => {
    try {
      const idToken = await fbUser.getIdToken(true);
      const res = await api.post("/api/users/login", { idToken });
      const dbUser = res.data.user;

      const newUser: User = {
        uid: fbUser.uid,
        id: dbUser.id,
        email: dbUser.email,
        phoneNumber: fbUser.phoneNumber || dbUser.phone,
        name: dbUser.firstName ? `${dbUser.firstName} ${dbUser.lastName}` : "Customer",
        role: dbUser.role,
        isAdmin: dbUser.role === "admin",
      };

      setUser(newUser);
    } catch (err: any) {
      console.error("❌ Backend sync failed:", err?.response?.data || err.message);
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
    return unsubscribe;
  }, [fetchAndSyncBackendUser]);

  // ✅ Send OTP wrapped in useCallback
  const sendOtp = useCallback(async (phoneNumber: string, elementId: string) => {
    try {
      setupRecaptcha(elementId);
      const appVerifier = (window as any).recaptchaVerifier;
      const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`;

      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmation(result);
    } catch (err) {
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
      console.error("❌ SEND OTP ERROR:", err);
      throw err;
    }
  }, []);

  // ✅ Verify OTP wrapped in useCallback
  const verifyOtp = useCallback(async (otpCode: string) => {
    try {
      if (!confirmation) throw new Error("OTP session expired");
      await confirmation.confirm(otpCode.trim());
    } catch (err: any) {
      console.error("❌ VERIFY OTP ERROR", err);
      throw new Error(getOtpErrorMessage(err));
    }
  }, [confirmation]);

  const signOut = useCallback(async () => {
    await logout();
    setUser(null);
    setConfirmation(null);
  }, []);

  const value = useMemo(() => ({
    user,
    isLoadingAuth,
    isAuthenticated: !!user,
    sendOtp,
    verifyOtp,
    signOut,
  }), [user, isLoadingAuth, sendOtp, verifyOtp, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ... Error handler wahi rahega ...
const getOtpErrorMessage = (error: any) => {
  const code = error?.code;

  switch (code) {
    case "auth/invalid-verification-code":
      return "Galat OTP dala gaya hai";
    case "auth/code-expired":
      return "OTP expire ho gaya hai, naya OTP mangaiye";
    case "auth/too-many-requests":
      return "Bahut jyada request ho gayi, thodi der baad try karein";
    case "auth/network-request-failed":
      return "Internet connection check karein";
    default:
      return "OTP verify nahi ho paaya, dobara try karein";
  }
};

/* =======================
   HOOK
======================= */

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
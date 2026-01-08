import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
// ✅ Web SDK ki jagah Native SDK imports
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
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
  sendOtp: (phoneNumber: string) => Promise<void>; 
  verifyOtp: (otpCode: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* =======================
   PROVIDER
======================= */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  // ✅ Confirmation object ka type badal gaya hai
  const [confirm, setConfirm] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

  /* =======================
     BACKEND SYNC
  ======================= */
  const fetchAndSyncBackendUser = useCallback(async (fbUser: FirebaseAuthTypes.User) => {
    try {
      // Force refresh token for latest claims
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

  /* =======================
     AUTH LISTENER
  ======================= */
  useEffect(() => {
    // ✅ Native SDK listener
    const unsubscribe = auth().onAuthStateChanged(async (fbUser) => {
      if (fbUser) {
        await fetchAndSyncBackendUser(fbUser);
      } else {
        setUser(null);
        setIsLoadingAuth(false);
      }
    });

    return unsubscribe;
  }, [fetchAndSyncBackendUser]);

  /* =======================
     OTP FUNCTIONS
  ======================= */

  // ✅ SEND OTP (Ab elementId ki zaroorat nahi hai!)
  const sendOtp = useCallback(async (phoneNumber: string) => {
    try {
      const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`;
      
      // Native SDK automatic reCAPTCHA handle karta hai (SafetyNet/Play Integrity se)
      const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
      setConfirm(confirmation);
    } catch (err: any) {
      console.error("❌ SEND OTP ERROR:", err.code, err.message);
      throw err;
    }
  }, []);

  // ✅ VERIFY OTP
  const verifyOtp = useCallback(async (otpCode: string) => {
    try {
      if (!confirm) throw new Error("OTP session expired");
      
      await confirm.confirm(otpCode.trim());
      // confirm hote hi onAuthStateChanged trigger ho jayega automatically
    } catch (err: any) {
      console.error("❌ VERIFY OTP ERROR", err);
      throw new Error(getOtpErrorMessage(err));
    }
  }, [confirm]);

  /* =======================
     SIGN OUT
  ======================= */
  const signOut = useCallback(async () => {
    try {
      await auth().signOut();
      setUser(null);
      setConfirm(null);
    } catch (err) {
      console.error("Sign out error", err);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    isLoadingAuth,
    isAuthenticated: !!user,
    sendOtp,
    verifyOtp,
    signOut,
  }), [user, isLoadingAuth, sendOtp, verifyOtp, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/* =======================
   ERROR HANDLER & HOOK
======================= */
const getOtpErrorMessage = (error: any) => {
  const code = error?.code;
  switch (code) {
    case "auth/invalid-verification-code": return "Galat OTP dala gaya hai";
    case "auth/code-expired": return "OTP expire ho gaya hai";
    case "auth/too-many-requests": return "Bahut jyada requests, baad mein try karein";
    default: return "OTP verify nahi ho paaya";
  }
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
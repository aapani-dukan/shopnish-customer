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

  // ✅ OTP flow
  sendOtp: (phoneNumber: string) => Promise<void>;
  verifyOtp: (otpCode: string) => Promise<void>;

  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* =======================
   PROVIDER
======================= */

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // 🔥 OTP confirmation state (MOST IMPORTANT FIX)
  const [confirmation, setConfirmation] = useState<any>(null);

  /* =======================
     BACKEND SYNC
  ======================= */

  const fetchAndSyncBackendUser = useCallback(
    async (fbUser: FirebaseUser) => {
      try {
        const idToken = await fbUser.getIdToken(true);

        const res = await api.post("/api/users/login", { idToken });
        const dbUser = res.data.user;

        const newUser: User = {
          uid: fbUser.uid,
          id: dbUser.id,
          email: dbUser.email,
          phoneNumber: fbUser.phoneNumber || dbUser.phone,
          name: dbUser.firstName
            ? `${dbUser.firstName} ${dbUser.lastName}`
            : "Customer",
          role: dbUser.role,
          isAdmin: dbUser.role === "admin",
        };

        setUser(newUser);
      } catch (err: any) {
        console.error(
          "❌ Backend sync failed:",
          err?.response?.data || err.message
        );
        setUser(null);
      } finally {
        setIsLoadingAuth(false);
      }
    },
    []
  );

  /* =======================
     AUTH LISTENER
  ======================= */

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

  /* =======================
     OTP FUNCTIONS
  ======================= */

  // ✅ SEND OTP
  const sendOtp = async (phoneNumber: string) => {
    try {
      const formattedPhone = phoneNumber.startsWith("+91")
        ? phoneNumber
        : `+91${phoneNumber}`;

      const result = await signInWithPhoneNumber(auth, formattedPhone);
      setConfirmation(result);
    } catch (err) {
      console.log("❌ SEND OTP ERROR:", err);
      throw err;
    }
  };

  // ✅ VERIFY OTP
  const verifyOtp = async (otpCode: string) => {
  try {
    if (!confirmation) {
      throw new Error("OTP session expired");
    }

    await confirmation.confirm(otpCode.trim());
  } catch (err: any) {
    console.log("❌ VERIFY OTP ERROR", err);
    throw new Error(getOtpErrorMessage(err));
  }
};

  /* =======================
     SIGN OUT
  ======================= */

  const signOut = async () => {
    await logout();
    setUser(null);
    setConfirmation(null);
  };

  /* =======================
     CONTEXT VALUE
  ======================= */

  const value = useMemo(
    () => ({
      user,
      isLoadingAuth,
      isAuthenticated: !!user,
      sendOtp,
      verifyOtp,
      signOut,
    }),
    [user, isLoadingAuth]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
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
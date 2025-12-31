import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  // @ts-ignore - Kuch versions mein yahan se export nahi dikhta par available hota hai
  getReactNativePersistence 
} from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

/* ==========================================================================
   FIREBASE CONFIG
   ========================================================================== */
const firebaseConfig = {
  apiKey: "AIzaSyChdYrxfxkfj6m04WT0nOBl5xCP62udcPU",
  authDomain: "aapani-dukan.firebaseapp.com",
  projectId: "aapani-dukan",
  storageBucket: "aapani-dukan.appspot.com",
  messagingSenderId: "352463214204",
  appId: "1:352463214204:web:a3adc9ef1d8af0de1fdbf9",
};

/* ==========================================================================
   INITIALIZE APP
   ========================================================================== */
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/* ==========================================================================
   AUTH INITIALIZATION (SAFE WAY)
   ========================================================================== */
let auth: any;

try {
  // React Native persistence ke saath initialize karein
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (error) {
  // Agar initializeAuth pehle hi ho chuka hai (hot reload mein)
  const { getAuth } = require("firebase/auth");
  auth = getAuth(app);
}

export { auth };

/* ==========================================================================
   AUTH HELPERS
   ========================================================================== */
export const signInWithEmail = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signUpWithEmail = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const onAuthStateChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const logout = async () => {
  await signOut(auth);
};
export const sendPasswordReset = (email: string) => sendPasswordResetEmail(auth, email);
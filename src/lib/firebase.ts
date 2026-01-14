import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut, 
  sendPasswordResetEmail 
} from '@react-native-firebase/auth';

// Auth instance ko initialize karein
const auth = getAuth();

/* ==========================================================================
   AUTH HELPERS (MODULAR VERSION)
   ========================================================================== */

// Email Sign In
export const signInWithEmail = async (email: string, password: string) => {
  // Purana: auth.signInWithEmailAndPassword(...) ❌
  // Naya: signInWithEmailAndPassword(auth, ...) ✅
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Email Sign Up
export const signUpWithEmail = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Auth State Change Listener
export const onAuthStateChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Logout
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

// Password Reset
export const sendPasswordReset = (email: string) => sendPasswordResetEmail(auth, email);

// Taaki purani files break na hon
export { auth };
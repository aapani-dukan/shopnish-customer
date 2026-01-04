import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView 
} from 'react-native';
// Naya Firebase Auth import
import auth from '@react-native-firebase/auth';

export default function AuthScreen() {
  const otpInputRef = useRef<TextInput>(null);
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirm, setConfirm] = useState<any>(null); // Firebase confirmation object
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Jab OTP screen aaye toh focus automatic ho jaye
  useEffect(() => {
    if (confirm && otpInputRef.current) {
      setTimeout(() => otpInputRef.current?.focus(), 500);
    }
  }, [confirm]);

  // Phase 1: Modern OTP Bhejna (No Recaptcha Modal needed)
  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert("Opps!", "Kripya 10 digit ka mobile number daalein.");
      return;
    }
    
    setIsLoading(true);
    try {
      const fullNumber = `+91${phoneNumber}`;
      // Firebase ka naya method jo invisible recaptcha handle karta hai
      const confirmation = await auth().signInWithPhoneNumber(fullNumber);
      setConfirm(confirmation);
      console.log("✅ OTP Sent Successfully");
    } catch (err: any) {
      console.error("❌ Send OTP Error:", err);
      // Agar Firebase console mein phone auth chalu nahi hai toh ye error dega
      Alert.alert("Error", "OTP bhejne mein dikkat hui. Firebase Console check karein.");
    } finally {
      setIsLoading(false);
    }
  };

  // Phase 2: OTP Verify karna
  const handleVerifyOtp = async () => {
    if (otpCode.length < 6) {
      Alert.alert("Adhura OTP", "6-digit ka code daalein.");
      return;
    }

    setIsLoading(true);
    try {
      // confirm.confirm hi OTP verify karta hai
      await confirm.confirm(otpCode);
      console.log("✅ Login Success!");
      // Navigation ab AuthContext ke onAuthStateChanged se automatic hogi
    } catch (err: any) {
      console.error("❌ Verify OTP Error:", err);
      Alert.alert("Invalid OTP", "Kripya sahi code daalein.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}>
        <View style={styles.card}>
          <Text style={styles.title}>Shopnish</Text>
          <Text style={styles.subtitle}>
            {!confirm ? 'Premium Multi-Seller Platform' : 'Confirm the code sent to your phone'}
          </Text>

          {!confirm ? (
            /* PHONE INPUT SECTION */
            <>
              <View style={styles.inputLabelContainer}>
                <Text style={styles.inputLabel}>Mobile Number</Text>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.prefix}>+91</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="9876543210" 
                  value={phoneNumber} 
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholderTextColor="#999"
                />
              </View>
              <TouchableOpacity 
                style={[styles.mainButton, isLoading && {backgroundColor: '#a5d6a7'}]} 
                onPress={handleSendOtp} 
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Get OTP</Text>}
              </TouchableOpacity>
            </>
          ) : (
            /* OTP INPUT SECTION */
            <>
              <View style={styles.inputLabelContainer}>
                <Text style={styles.inputLabel}>Enter 6-Digit OTP</Text>
              </View>
              <TextInput 
                ref={otpInputRef}
                style={[styles.input, styles.otpInput]} 
                placeholder="000000" 
                value={otpCode} 
                onChangeText={setOtpCode}
                keyboardType="number-pad"
                maxLength={6}
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                placeholderTextColor="#ddd"
              />
              <TouchableOpacity 
                style={[styles.mainButton, isLoading && {backgroundColor: '#a5d6a7'}]} 
                onPress={handleVerifyOtp} 
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Login</Text>}
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => { setConfirm(null); setOtpCode(""); }} style={styles.backButton}>
                <Text style={styles.backButtonText}>Number badalna hai?</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        <Text style={styles.footerText}>By continuing, you agree to our Terms & Conditions</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Styles wahi hain jo aapne diye the - Shopnish Premium Look!
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  card: { backgroundColor: '#fff', padding: 30, borderRadius: 30, marginHorizontal: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  title: { fontSize: 36, fontWeight: '900', color: '#1A1A1A', textAlign: 'center', letterSpacing: -1 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 40, marginTop: 5 },
  inputLabelContainer: { marginBottom: 8, marginLeft: 4 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#333', textTransform: 'uppercase', letterSpacing: 1 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 15, marginBottom: 25, borderWidth: 1, borderColor: '#E5E7EB' },
  prefix: { paddingLeft: 18, fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
  input: { flex: 1, padding: 18, fontSize: 18, color: '#1A1A1A', fontWeight: '500' },
  otpInput: { backgroundColor: '#F3F4F6', borderRadius: 15, textAlign: 'center', letterSpacing: 12, fontSize: 24, marginBottom: 25, fontWeight: 'bold' },
  mainButton: { backgroundColor: '#3DDC84', padding: 20, borderRadius: 15, alignItems: 'center', shadowColor: '#3DDC84', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18, letterSpacing: 0.5 },
  backButton: { marginTop: 20 },
  backButtonText: { color: '#666', textAlign: 'center', fontSize: 14, fontWeight: '500' },
  footerText: { textAlign: 'center', color: '#999', fontSize: 11, marginTop: 30, paddingHorizontal: 40 }
});
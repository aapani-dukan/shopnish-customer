import React, { useState, useRef, useEffect } from "react";
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
  ScrollView,
} from "react-native";

import { useAuth } from "../context/AuthContext";

export default function AuthScreen() {
  const { sendOtp, verifyOtp } = useAuth();

  const otpInputRef = useRef<TextInput>(null);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Timer logic (Same as before)
  useEffect(() => {
    if (!isOtpSent) return;
    setTimer(30);
    setCanResend(false);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOtpSent]);

  /* =====================
     SEND OTP (Updated)
  ===================== */
  const handleSendOtp = async () => {
    if (phoneNumber.length !== 10) {
      Alert.alert("Error", "Kripya 10 digit ka mobile number daalein");
      return;
    }

    setIsLoading(true);
    try {
      // ✅ AB SIRF PHONE NUMBER CHAHIYE
      await sendOtp(phoneNumber); 
      setIsOtpSent(true);
    } catch (err: any) {
      console.log("Error Code:", err.code);
      Alert.alert("OTP Error", "Kripya check karein ki SHA-1 aur Play Integrity enable hai.");
    } finally {
      setIsLoading(false);
    }
  };

  /* =====================
     VERIFY OTP
  ===================== */
  const handleVerifyOtp = async () => {
    if (otpCode.length < 6) return;

    setIsLoading(true);
    try {
      await verifyOtp(otpCode);
    } catch (err: any) {
      Alert.alert("Invalid OTP", err.message || "Galat OTP hai");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <View style={styles.card}>
          <Text style={styles.title}>Shopnish</Text>
          <Text style={styles.subtitle}>
            {!isOtpSent
              ? "Premium Multi-Seller Platform"
              : "Apne phone par bheja gaya OTP dalein"}
          </Text>

          {!isOtpSent ? (
            <>
              <View style={styles.inputLabelContainer}>
                <Text style={styles.inputLabel}>Mobile Number</Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.prefix}>+91</Text>
                <TextInput
                  style={styles.input}
                  placeholder="00000-00000"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholderTextColor="#999"
                />
              </View>

              <TouchableOpacity
                style={styles.mainButton}
                onPress={handleSendOtp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Get OTP</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.inputLabelContainer}>
                <Text style={styles.inputLabel}>Enter OTP</Text>
              </View>

              <TextInput
                ref={otpInputRef}
                style={[styles.input, styles.otpInput]}
                placeholder="000000"
                keyboardType="number-pad"
                maxLength={6}
                value={otpCode}
                onChangeText={(text) => {
                  setOtpCode(text);
                  if (text.length === 6) handleVerifyOtp();
                }}
              />

              <TouchableOpacity
                style={styles.mainButton}
                onPress={handleVerifyOtp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verify & Login</Text>
                )}
              </TouchableOpacity>

              {canResend ? (
                <TouchableOpacity onPress={handleSendOtp}>
                  <Text style={styles.resendText}>OTP dubara bhejein</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.timerText}>
                  Resend available in {timer}s
                </Text>
              )}

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setIsOtpSent(false);
                  setOtpCode("");
                }}
              >
                <Text style={styles.backButtonText}>Number galat hai?</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#001B3A" }, // Dark Blue Background (Logo Match)
  card: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 30,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: { fontSize: 36, fontWeight: "900", textAlign: "center", color: "#001B3A" },
  subtitle: { textAlign: "center", marginBottom: 40, color: "#666", fontSize: 14 },
  inputLabelContainer: { marginBottom: 8 },
  inputLabel: { fontSize: 12, fontWeight: "700", color: "#001B3A", textTransform: "uppercase" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  prefix: { paddingLeft: 18, fontSize: 18, fontWeight: "600", color: "#333" },
  input: { flex: 1, padding: 18, fontSize: 18, color: "#000" },
  otpInput: { 
    textAlign: "center", 
    letterSpacing: 10, 
    fontSize: 24, 
    marginBottom: 25, 
    backgroundColor: "#F3F4F6",
    borderRadius: 15 
  },
  mainButton: { 
    backgroundColor: "#D4AF37", // Gold Color (Logo Match)
    padding: 20, 
    borderRadius: 15, 
    alignItems: "center" 
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  resendText: { textAlign: "center", color: "#D4AF37", marginTop: 15, fontWeight: "700" },
  timerText: { textAlign: "center", color: "#999", marginTop: 15, fontSize: 13 },
  backButton: { marginTop: 20 },
  backButtonText: { textAlign: "center", color: "#666", textDecorationLine: "underline" },
});
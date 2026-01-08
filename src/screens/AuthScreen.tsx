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

  // Focus OTP input on OTP send
  useEffect(() => {
    if (isOtpSent && otpInputRef.current) {
      setTimeout(() => otpInputRef.current?.focus(), 500);
    }
  }, [isOtpSent]);

  // OTP resend timer
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

  // Auto verify when OTP filled
  useEffect(() => {
    if (otpCode.length === 6) {
      handleVerifyOtp();
    }
  }, [otpCode]);

  /* =====================
     SEND OTP
  ===================== */
  // AuthContext.tsx se update kiya gaya function call
const handleSendOtp = async () => {
  if (phoneNumber.length !== 10) {
    Alert.alert("Error", "Kripya 10 digit ka mobile number daalein");
    return;
  }

  setIsLoading(true);
  try {
    // Agar aapne mera pichla context wala code copy kiya hai, 
    // toh wahan 2 parameters chahiye: (phoneNumber, elementId)
    // Mobile par 'elementId' ki jagah null ya invisible container chahiye.
    await sendOtp(phoneNumber, "recaptcha-container"); 
    setIsOtpSent(true);
  } catch (err: any) {
    console.log(err.code); // Isse check karein exact error kya hai
    Alert.alert("OTP Error", err.message);
  } finally {
    setIsLoading(false);
  }
};

  /* =====================
     VERIFY OTP
  ===================== */
  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) return;

    setIsLoading(true);
    try {
      await verifyOtp(otpCode);
      // ✅ Login success → AuthContext handle karega
    } catch (err: any) {
      Alert.alert("Invalid OTP", "Galat OTP hai, fir se try karein");
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
              : "Confirm the OTP sent to your phone"}
          </Text>

          {!isOtpSent ? (
            <>
              {/* Phone Input */}
              <View style={styles.inputLabelContainer}>
                <Text style={styles.inputLabel}>Mobile Number</Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.prefix}>+91</Text>
                <TextInput
                  style={styles.input}
                  placeholder="9876543210"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
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
              {/* OTP Input */}
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
                onChangeText={setOtpCode}
              />

              {/* Verify OTP */}
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

              {/* Resend OTP */}
              {canResend ? (
                <TouchableOpacity
                  onPress={async () => {
                    setIsOtpSent(false); 
                    setOtpCode("");
                    setTimeout(async () => {
                      await handleSendOtp();
                      setIsOtpSent(true);
                    }, 100);
                  }}
                >
                  <Text style={{ textAlign: "center", color: "#3DDC84", marginTop: 15, fontWeight: "600" }}>
                    OTP dubara bhejein
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={{ textAlign: "center", color: "#999", marginTop: 15, fontSize: 13 }}>
                  OTP dubara bhejne ke liye {timer}s rukna hoga
                </Text>
              )}

              {/* Back button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setIsOtpSent(false);
                  setOtpCode("");
                }}
              >
                <Text style={styles.backButtonText}>Number badalna hai?</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.footerText}>
          By continuing, you agree to our Terms & Conditions
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* =====================
   STYLES
===================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  card: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 30,
    marginHorizontal: 20,
    elevation: 5,
  },
  title: { fontSize: 36, fontWeight: "900", textAlign: "center" },
  subtitle: { textAlign: "center", marginBottom: 40, color: "#666" },
  inputLabelContainer: { marginBottom: 8 },
  inputLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 15,
    marginBottom: 25,
  },
  prefix: { paddingLeft: 18, fontSize: 18 },
  input: { flex: 1, padding: 18, fontSize: 18 },
  otpInput: { textAlign: "center", letterSpacing: 12, fontSize: 24, marginBottom: 25 },
  mainButton: { backgroundColor: "#3DDC84", padding: 20, borderRadius: 15, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  backButton: { marginTop: 20 },
  backButtonText: { textAlign: "center", color: "#666" },
  footerText: { textAlign: "center", fontSize: 11, marginTop: 30, color: "#999" },
});
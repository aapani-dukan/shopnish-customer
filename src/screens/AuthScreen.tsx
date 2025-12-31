import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  sendPasswordReset 
} from '../lib/firebase';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('shivraj8404@gmail.com'); // Pre-filled jaisa aapke web app me tha
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Bhaiya!", "Email aur Password dono bhariye.");
      return;
    }
    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        if (password !== confirmPassword) throw new Error("Passwords match nahi ho rahe");
        await signUpWithEmail(email, password);
        Alert.alert("Success", "Account ban gaya! Ab login karein.");
        setIsLogin(true);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
          
          <TextInput 
            style={styles.input} 
            placeholder="Email" 
            value={email} 
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput 
            style={styles.input} 
            placeholder="Password" 
            value={password} 
            onChangeText={setPassword}
            secureTextEntry 
          />

          {!isLogin && (
            <TextInput 
              style={styles.input} 
              placeholder="Confirm Password" 
              value={confirmPassword} 
              onChangeText={setConfirmPassword}
              secureTextEntry 
            />
          )}

          <TouchableOpacity style={styles.mainButton} onPress={handleAuth} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Sign Up'}</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={{marginTop: 20}}>
            <Text style={{color: '#2563eb', textAlign: 'center'}}>
              {isLogin ? "Naya account banayein (Sign Up)" : "Purana account hai? Login karein"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f3f4f6' },
  card: { backgroundColor: '#fff', padding: 30, borderRadius: 20, elevation: 5 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#f9fafb', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  mainButton: { backgroundColor: '#2563eb', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
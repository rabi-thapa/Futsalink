import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const UserVerificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email, role } = route.params; // Get email and role from SignInScreen

  const [loading, setLoading] = useState(false);

  // Function to send OTP via email
  const sendOtp = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://10.0.2.2:3000/api/user/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }
      Alert.alert('Success', 'OTP sent successfully');
     
      navigation.navigate('OtpVerification', { email, role });
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Verify Your Account</Text>
        <Text style={styles.subtitle}>
          An OTP will be sent to {email} to verify your identity.
        </Text>
        <Pressable style={styles.sendOtpButton} onPress={sendOtp} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendOtpButtonText}>Send OTP</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default UserVerificationScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
    
  },
  innerContainer: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    letterSpacing: 1.2,
    color: '#2a2a2a', // Dark gray for the title
  },
  subtitle: {
    fontSize: 18,
    color: '#404040',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,

  },
  sendOtpButton: {
    backgroundColor: '#2dcf30',
    paddingVertical: 15,
    borderRadius: 10,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  sendOtpButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

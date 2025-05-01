import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OtpVerificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email, role } = route.params; // Get email and role from UserVerificationScreen

  const [otp, setOtp] = useState(['', '', '', '']); // Array to store OTP digits
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  // Function to handle OTP input
  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move focus to the next input box if a digit is entered
    if (text && index < 3) {
      inputs.current[index + 1].focus();
    }
  };

  // Function to verify OTP
  const verifyOtp = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length !== 4) {
      Alert.alert('Error', 'Please enter the full OTP');
      return;
    }
    try {
      setLoading(true);
      const response = await fetch('http://10.0.2.2:3000/api/user/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: fullOtp }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      // Store tokens and user details in AsyncStorage
      await AsyncStorage.setItem('accessToken', data.accessToken);
      await AsyncStorage.setItem('refreshToken', data.refreshToken);
      await AsyncStorage.setItem('userId', data.userId);
      await AsyncStorage.setItem('userRole', data.userRole);

     

      // Navigate based on user role
      if (data.userRole === 'customer') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else if (data.userRole === 'vendor') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'VendorStack' }],
        });
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>
          Enter the OTP sent to {email} to continue.
        </Text>
        <View style={styles.otpInputContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputs.current[index] = ref)}
              style={styles.otpInput}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              keyboardType="numeric"
              maxLength={1}
            />
          ))}
        </View>
        <Pressable
          style={styles.verifyOtpButton}
          onPress={verifyOtp}
          disabled={loading || otp.join('').length !== 4}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyOtpButtonText}>Verify OTP</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default OtpVerificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  innerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 5,
    padding: 10,
    width: 50,
    height: 50,
    fontSize: 20,
    textAlign: 'center',
  },
  verifyOtpButton: {
    backgroundColor: '#2dcf30',
    padding: 15,
    borderRadius: 10,
    width: '100%',
  },
  verifyOtpButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
});
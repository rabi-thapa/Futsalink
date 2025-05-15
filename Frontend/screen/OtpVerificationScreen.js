import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import { theme } from '../core/theme';
import Paragraph from '../components/Paragraph';

const OtpVerificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { email } = route.params;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOtpChange = (text) => {
    // Allow only numbers and max length of 4
    if (/^\d*$/.test(text) && text.length <= 4) {
      setOtp(text);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 4) {
      Alert.alert('Error', 'Please enter the full OTP');
      return;
    }
    try {
      setLoading(true);
      const response = await fetch('http://10.0.2.2:3000/api/user/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'OTP verification failed');

      await AsyncStorage.setItem('accessToken', data.accessToken);
      await AsyncStorage.setItem('refreshToken', data.refreshToken);
      await AsyncStorage.setItem('userId', data.userId);
      await AsyncStorage.setItem('userRole', data.userRole);

      if (data.userRole === 'customer') {
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } else if (data.userRole === 'vendor') {
        navigation.reset({ index: 0, routes: [{ name: 'VendorStack' }] });
      }

      Alert.alert('User Sign In Successfully');
    } catch (error) {
      Alert.alert('OTP Error', error.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <Logo />
      <Header>OTP Verification</Header>

      

      <View style={styles.otpInputContainer}>
        <TextInput
          style={styles.otpInput}
          value={otp}
          onChangeText={handleOtpChange}
          keyboardType="numeric"
          maxLength={4}
          placeholder="Enter OTP"
          textAlign="center"
        />
      </View>

      <Button
        style={styles.verifyOtpButton}
        labelStyle={styles.buttonLabel}
        onPress={verifyOtp}
        mode="contained"
        disabled={loading || otp.length !== 4}>
        {loading ? <ActivityIndicator color="#fff" /> : 'Verify OTP'}
      </Button>
    </Background>
  );
};

export default OtpVerificationScreen;

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 16,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  otpInputContainer: {
    width: '80%',
    marginBottom: 20,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 5,
    padding: 12,
    height: 50,
    fontSize: 20,
    backgroundColor: theme.colors.surface,
  },
  verifyOtpButton: {
    marginTop: 10,
    backgroundColor: theme.colors.secondary,
  },
});
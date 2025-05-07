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
  const { email, role } = route.params;

  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 3) {
      inputs.current[index + 1].focus();
    }
  };

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: fullOtp }),
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
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <Logo />
      <Header>OTP Verification</Header>
      {/* <Text style={styles.subtitle}>Enter the OTP sent to {email}</Text> */}

      <Paragraph style={styles.subtitle}>
        An OTP will be sent to <Text style={{fontWeight: 'bold'}}>{email}</Text>
      </Paragraph>

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

      <Button
         style={styles.verifyOtpButton}
         labelStyle={styles.buttonLabel} 
        onPress={verifyOtp}
        mode="contained"
        disabled={loading || otp.join('').length !== 4}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          'Verify OTP'
        )}
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
    backgroundColor: theme.colors.surface,
  },
  verifyOtpButton: {
    marginTop: 10,
    backgroundColor: theme.colors.secondary, 
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
});

import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

import Background from '../components/Background';
import Logo2 from '../components/Logo2';
import Header from '../components/Header';
import Button from '../components/Button';

import Paragraph from '../components/Paragraph';

const UserVerificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {email, role} = route.params; // Get email and role from SignInScreen

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
        body: JSON.stringify({email}),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }
      Alert.alert('Success', 'OTP sent successfully');

      navigation.navigate('OtpVerification', {email});
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <Logo2 />
      <Header>Verify Your Account</Header>
      <Paragraph style={styles.subtitle}>
        An OTP will be sent to <Text style={{fontWeight: 'bold'}}>{email}</Text>
      </Paragraph>

      <Button style={styles.verifyOtpButton} onPress={sendOtp} mode="contained">
        Send OTP
      </Button>
    </Background>
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

  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
});

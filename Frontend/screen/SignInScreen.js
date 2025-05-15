import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Text, Snackbar } from 'react-native-paper';
import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import BackButton from '../components/BackButton';
import Dropdown from '../components/Dropdown';

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState({ value: '', error: '' });
  const [password, setPassword] = useState({ value: '', error: '' });
  const [role, setRole] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleProceedToVerification = async () => {
    // Reset snackbar
    setSnackbarVisible(false);

    // Basic frontend validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = email.value && emailRegex.test(email.value);
    const isValidPassword = password.value.length >= 6;

    setEmail({ ...email, error: isValidEmail ? '' : 'Enter a valid email.' });
    setPassword({
      ...password,
      error: isValidPassword ? '' : 'Password must be at least 6 characters.',
    });

    if (!isValidEmail || !isValidPassword || !role) {
      if (!role) {
        setSnackbarMessage('Please select a role.');
        setSnackbarVisible(true);
      }
      return;
    }

    try {
      const response = await fetch('http://10.0.2.2:3000/api/user/proceed-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.value,
          password: password.value,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      setSnackbarMessage('Verified.');
      setSnackbarVisible(true);

      setTimeout(() => {
        navigation.navigate('UserVerification', {
          email: email.value,
          role,
        });
      }, 500);
    } catch (error) {
      setSnackbarMessage(error.message || 'Something went wrong.');
      setSnackbarVisible(true);
    }
  };

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Welcome to Futsalink.</Header>

      {/* Email Input */}
      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* Password Input */}
      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />

      {/* Role Dropdown */}
      <Dropdown
        selectedValue={role}
        onValueChange={(itemValue) => setRole(itemValue)}
        items={[
          { label: 'Role', value: '' },
          { label: 'Customer', value: 'customer' },
          { label: 'Vendor', value: 'vendor' },
        ]}
      />

      {/* Sign In Button */}
      <Button mode="contained" onPress={handleProceedToVerification}>
        Proceed to Verification
      </Button>

      {/* Forgot Password */}
      <View style={styles.forgotPassword}>
        <TouchableOpacity onPress={() => navigation.navigate('ResetPasswordScreen')}>
          <Text style={styles.forgot}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>

      {/* Register Link */}
      <View style={styles.row}>
        <Text>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace('SignUp')}>
          <Text style={styles.link}>Sign up</Text>
        </TouchableOpacity>
      </View>

      {/* Snackbar for feedback */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={[
          styles.snackbar,
          snackbarMessage.includes('Verified') ? { backgroundColor: '#4caf50' } : {},
        ]}>
        {snackbarMessage}
      </Snackbar>
    </Background>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginTop: 10,
  },
  forgot: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  link: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  snackbar: {
    position: 'absolute',
    bottom: 10,
    marginHorizontal: 10,
    borderRadius: 8,
  },
});
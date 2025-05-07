import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Text, Snackbar } from 'react-native-paper';
import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import BackButton from '../components/BackButton';
import { theme } from '../core/theme';
import Dropdown from '../components/Dropdown';

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState({ value: '', error: '' });
  const [password, setPassword] = useState({ value: '', error: '' });
  const [role, setRole] = useState('');
  const [roleError, setRoleError] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleProceedToVerification = async () => {
    setSnackbarVisible(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = email.value && emailRegex.test(email.value);
    const isValidPassword = password.value.length >= 6;
    const roleValidationError = role ? '' : 'Role is required';

    setEmail({ ...email, error: isValidEmail ? '' : 'Enter a valid email.' });
    setPassword({
      ...password,
      error: isValidPassword ? '' : 'Password must be at least 6 characters.',
    });
    setRoleError(roleValidationError);

    if (!isValidEmail || !isValidPassword || roleValidationError) return;

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

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid server response.');
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Verification failed.');
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
      setSnackbarMessage(error.message || 'Error occurred.');
      setSnackbarVisible(true);
    }
  };

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Welcome to Futsalink.</Header>

      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        
      />

      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />

      <Dropdown
        selectedValue={role}
        onValueChange={(itemValue) => {
          setRole(itemValue);
          setRoleError('');
        }}
        theme={{ colors: { primary: 'green' } }}
        items={[
          { label: 'Role', value: '' },
          { label: 'Customer', value: 'customer' },
          { label: 'Vendor', value: 'vendor' },
        ]}

      />
      <Text style={styles.errorText}>{roleError}</Text>

      <View style={styles.forgotPassword}>
        <TouchableOpacity onPress={() => navigation.navigate('ResetPasswordScreen')}>
          <Text style={styles.forgot}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>

      <Button mode="contained" onPress={handleProceedToVerification}>
        Proceed to Verification
      </Button>

      <View style={styles.row}>
        <Text>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace('SignUp')}>
          <Text style={styles.link}>Sign up</Text>
        </TouchableOpacity>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={[
          styles.snackbar,
          snackbarMessage.includes('Verified') ? { backgroundColor: '#4caf50' } : {},
        ]}
      >
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
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium',
    fontStyle: 'italic',
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 13,
    textAlign: 'left',
    width: '100%',
  },
  snackbar: {
    position: 'absolute',
    bottom: 10,
    marginHorizontal: 10,
    borderRadius: 8,
  },
});

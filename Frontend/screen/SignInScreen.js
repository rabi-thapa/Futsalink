import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';
import {Snackbar} from 'react-native-paper';

const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('customer');

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigation = useNavigation();

  const handleProceedToVerification = async () => {
    setSnackbarVisible(false);
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    if (!email || !emailRegex.test(email)) {
      setSnackbarMessage('Enter a valid email.');
      setSnackbarVisible(true);
      return;
    }
  
    if (!role) {
      setSnackbarMessage('Select a role.');
      setSnackbarVisible(true);
      return;
    }
  
    try {
      const response = await fetch('http://10.0.2.2:3000/api/user/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
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
        navigation.navigate('UserVerification', { email, role });
      }, 500);
    } catch (error) {
      setSnackbarMessage(error.message || 'Error occurred.');
      setSnackbarVisible(true);
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.welcomeMessage}>Welcome to FutsaLink</Text>
        <Text style={styles.helloMessage}>
          Hello! Please sign in to continue.
        </Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.label}>Select Role</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={role}
              onValueChange={itemValue => setRole(itemValue)}
              style={styles.picker}>
              <Picker.Item label="Customer" value="customer" />
              <Picker.Item label="Vendor" value="vendor" />
              <Picker.Item label="Admin" value="admin" />
            </Picker>
          </View>
        </View>
        <Pressable
          style={[
            styles.signInButton,
            email.length > 4 && role
              ? styles.signInButtonActive
              : styles.signInButtonInactive,
          ]}
          onPress={handleProceedToVerification}
          disabled={!email || !role}>
          <Text style={styles.signInButtonText}>Proceed to Verification</Text>
        </Pressable>
      </View>

      <View style={styles.bottomContainer}>
        <Text style={styles.bottomText}>Don't have an account?</Text>
        <Pressable onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.signUpText}>Sign Up</Text>
        </Pressable>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={[
            styles.snackbar,
            snackbarMessage.includes('successful')
              ? {backgroundColor: '#4caf50'}
              : null,
          ]}>
          {snackbarMessage}
        </Snackbar>
      </View>
    </SafeAreaView>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  innerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  welcomeMessage: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  helloMessage: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: '#444',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 20,
  },
  picker: {
    height: 50,
  },
  signInButton: {
    padding: 15,
    borderRadius: 10,
    width: '100%',

    backgroundColor: '#2dcf30',

    borderRadius: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  signInButtonActive: {
    backgroundColor: '#5dbea3',
  },
  signInButtonInactive: {
    backgroundColor: '#E0E0E0',
  },
  signInButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#f2f2f2',
  },
  bottomText: {
    fontSize: 16,
    color: '#333',
  },
  signUpText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2dcf30',
    marginLeft: 5,
  },

  snackbar: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    backgroundColor: '#323232',
    borderRadius: 5,
    padding: 10,
  },
});

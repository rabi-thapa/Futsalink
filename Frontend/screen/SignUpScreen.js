import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  Pressable,
  Text,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import BackButton from '../components/BackButton';
import {emailValidator} from '../helpers/emailValidator';
import {passwordValidator} from '../helpers/passwordValidator';
import Dropdown from '../components/Dropdown';
import Icon from 'react-native-vector-icons/Feather';

const SignUpScreen = ({navigation}) => {
  const [firstName, setFirstName] = useState({value: '', error: ''});
  const [role, setRole] = useState('');
  const [email, setEmail] = useState({value: '', error: ''});
  const [password, setPassword] = useState({value: '', error: ''});
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectProfileImage = () => {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (!response.didCancel && response.assets?.length > 0) {
        setProfileImage(response.assets[0]);
      }
    });
  };

  const handleSignUp = async () => {
    
    const firstNameError = !firstName.value.trim() ? 'First name is required' : '';
    setFirstName({...firstName, error: firstNameError});

    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);

   
   setEmail({...email, error: emailError});
   setPassword({...password, error: passwordError});

   
   if (firstNameError || emailError || passwordError) {
     return;
   }

   if (!role) {
     Alert.alert('Error', 'Please select a role.');
     return;
   }

   if (!profileImage) {
     Alert.alert('Error', 'Please choose a profile image.');
     return;
   }


    setLoading(true);

    const formData = new FormData();

    formData.append('firstName', firstName.value);
    formData.append('role', role);
    formData.append('email', email.value);
    formData.append('password', password.value);

    formData.append('profileImage', {
      uri: profileImage.uri,
      type: profileImage.type,
      name: profileImage.fileName || `profile_${Date.now()}.jpg`,
    });

    try {
      const response = await fetch('http://10.0.2.2:3000/api/user', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      await AsyncStorage.setItem('userId', data.userId);
      await AsyncStorage.setItem('userRole', data.role);
      await AsyncStorage.setItem('accessToken', data.accessToken);

      Alert.alert('Success', 'User registered successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('SignIn'),
        },
      ]);
    } catch (error) {
      
      Alert.alert('Error', 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <BackButton
        goBack={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('SignIn'); 
          }
        }}
      />

      <Image source={require('../assets/logo2.png')} style={styles.logo} />
      <Header>Create Account</Header>

      <View style={styles.imagePickerWrapper}>
        <Pressable onPress={selectProfileImage} style={styles.imagePicker}>
          {profileImage ? (
            <Image
              source={{uri: profileImage.uri}}
              style={styles.profileImage}
            />
          ) : (
            <Icon name="image" size={32} color="#777" />
          )}
        </Pressable>
        <Text style={styles.imageText}>
          {profileImage ? 'Tap to change' : 'Add Profile Image'}
        </Text>
      </View>

      {/* First Name */}
      <TextInput
        label="First Name"
        returnKeyType="next"
        value={firstName.value}
        onChangeText={text => setFirstName({value: text, error: ''})}
        error={!!firstName.error}
        errorText={firstName.error}
      />

      <Dropdown
        selectedValue={role}
        onValueChange={setRole}
        items={[
          {label: 'Select Role', value: ''},
          {label: 'Customer', value: 'customer'},
          {label: 'Vendor', value: 'vendor'},
        ]}
      />

      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={text => setEmail({value: text, error: ''})}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={text => setPassword({value: text, error: ''})}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />

       {/* Submit Button */}
      <Button
        mode="contained"
        onPress={handleSignUp}
        style={{marginTop: 24}}
        disabled={loading}>
        {loading ? <ActivityIndicator color="#FFF" /> : 'Sign Up'}
      </Button>
    </Background>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  logo: {
    width: 110,
    height: 110,
    marginBottom: 8,
  },
  imagePickerWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePicker: {
    height: 100,
    width: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
});

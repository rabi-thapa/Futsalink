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
import {theme} from '../core/theme';
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
    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);

    if (emailError || passwordError || !role || !profileImage) {
      if (!role) Alert.alert('Error', 'Please select a role.');
      if (!profileImage) Alert.alert('Error', 'Please choose a profile image.');
      setEmail({...email, error: emailError});
      setPassword({...password, error: passwordError});
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

      Alert.alert('Success', 'User registered successfully!');
      navigation.reset({index: 0, routes: [{name: 'SignIn'}]});
    } catch (error) {
      console.error(error);
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
            navigation.navigate('SignIn'); // Or your fallback screen
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

// import {
//   StyleSheet,
//   Text,
//   View,
//   SafeAreaView,
//   TextInput,
//   Pressable,
//   Image,
//   Alert,
//   ActivityIndicator,
//   ScrollView,
// } from 'react-native';
// import React, {useState, useContext} from 'react';
// import {Picker} from '@react-native-picker/picker';
// import {launchImageLibrary} from 'react-native-image-picker';
// import {useNavigation} from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {AuthContext} from '../AuthContext';

// const SignUpScreen = () => {
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [role, setRole] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [profileImage, setProfileImage] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const navigation = useNavigation();

//   const selectProfileImage = () => {
//     launchImageLibrary({mediaType: 'photo'}, response => {
//       if (!response.didCancel && response.assets?.length > 0) {
//         setProfileImage(response.assets[0]);
//       }
//     });
//   };

//   const handleSignUp = async () => {
//     if (!firstName || !lastName || !email || !password || !role) {
//       Alert.alert(
//         'Error',
//         'All fields are required, including a profile image and role.',
//       );
//       return;
//     }

//     setLoading(true);

//     const formData = new FormData();
//     formData.append('firstName', firstName);
//     formData.append('lastName', lastName);
//     formData.append('role', role);
//     formData.append('email', email);
//     formData.append('password', password);

//     if (profileImage) {
//       formData.append('profileImage', {
//         uri: profileImage.uri,
//         type: profileImage.type,
//         name: profileImage.fileName || `profile_${Date.now()}.jpg`,
//       });
//     }

//     try {
//       const response = await fetch('http://10.0.2.2:3000/api/user', {
//         method: 'POST',
//         body: formData,
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       const data = await response.json();

//       console.log('API Response', data);

//       if (!response.ok) {
//         throw new Error(data.message || 'Signup failed');
//       }

//       await AsyncStorage.setItem('userId', data.userId);
//       await AsyncStorage.setItem('userRole', data.role);
//       await AsyncStorage.setItem('accessToken', data.accessToken);

//       Alert.alert('Success', 'User registered successfully!');
//       navigation.navigate('Main');
//     } catch (error) {
//       console.error(error);
//       Alert.alert('Error', 'Failed to register. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView>
//       <SafeAreaView style={styles.container}>
//         <View style={styles.innerContainer}>
//           <View style={styles.inputContainer}>
//             <Text style={styles.label}>First Name *</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="First Name"
//               value={firstName}
//               onChangeText={setFirstName}
//             />

//             <Text style={styles.label}>Last Name *</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Last Name"
//               value={lastName}
//               onChangeText={setLastName}
//             />

//             <Text style={styles.label}>Role *</Text>
//             <View style={styles.pickerContainer}>
//               <Picker
//                 selectedValue={role}
//                 onValueChange={setRole}
//                 style={styles.picker}>
//                 <Picker.Item label="Select Role" value="" />
//                 <Picker.Item label="Customer" value="customer" />
//                 <Picker.Item label="Admin" value="admin" />
//                 <Picker.Item label="Vendor" value="vendor" />
//               </Picker>
//             </View>

//             <Text style={styles.label}>Email *</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Email"
//               value={email}
//               onChangeText={setEmail}
//               keyboardType="email-address"
//             />

//             <Text style={styles.label}>Password *</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Password"
//               secureTextEntry
//               value={password}
//               onChangeText={setPassword}
//             />

//             <Text style={styles.label}>Profile Image *</Text>
//             <Pressable style={styles.imagePicker} onPress={selectProfileImage}>
//               {profileImage ? (
//                 <Image
//                   source={{uri: profileImage.uri}}
//                   style={styles.profileImage}
//                 />
//               ) : (
//                 <Text style={styles.imagePlaceholder}>Select Image</Text>
//               )}
//             </Pressable>

//             <Pressable
//               style={[
//                 styles.signUpButton,
//                 loading && {backgroundColor: '#A0A0A0'},
//               ]}
//               onPress={handleSignUp}
//               disabled={loading}>
//               {loading ? (
//                 <ActivityIndicator color="#FFF" />
//               ) : (
//                 <Text style={styles.signUpText}>Sign Up</Text>
//               )}
//             </Pressable>
//           </View>
//         </View>
//       </SafeAreaView>
//     </ScrollView>
//   );
// };

// export default SignUpScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F4F7FC',
//   },

//   innerContainer: {
//     paddingVertical: 6,
//     paddingHorizontal: 8,
//   },

//   heading: {
//     fontSize: 26,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginVertical: 10,
//     color: '#007bff',
//     letterSpacing: 1,
//     textShadowColor: 'rgba(0, 0, 0, 0.1)',
//     textShadowOffset: {width: 2, height: 2},
//     textShadowRadius: 2,
//   },

//   inputContainer: {
//     marginVertical: 10,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     shadowColor: '#000',
//     paddingVertical: 10,
//     paddingHorizontal: 7,
//     shadowOffset: {width: 0, height: 2},
//     shadowRadius: 4,
//     elevation: 5,
//   },

//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },

//   pickerWrapper: {
//     flex: 1,
//     marginRight: 10,
//   },

//   pickerContainer: {
//     borderColor: '#D0D0D0',
//     borderWidth: 1,
//     borderRadius: 10,
//     overflow: 'hidden',
//     height: 45,
//     justifyContent: 'center',
//     backgroundColor: '#FAFAFA',
//   },

//   picker: {
//     fontSize: 14,
//     color: '#000',
//     paddingVertical: 0,
//   },

//   datePickerWrapper: {
//     flex: 1,
//   },

//   label: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#333',
//     marginBottom: 7,
//   },

//   input: {
//     padding: 12,
//     borderColor: '#D0D0D0',
//     borderWidth: 1,
//     borderRadius: 10,
//     fontSize: 14,
//     marginBottom: 10,
//   },

//   dateInput: {
//     padding: 12,
//     borderColor: '#D0D0D0',
//     borderWidth: 1,
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'flex-start',
//   },

//   dateText: {
//     fontSize: 14,
//     color: '#000',
//   },

//   imagePicker: {
//     height: 100,
//     borderWidth: 1,
//     borderColor: '#D0D0D0',
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F8F8F8',
//     marginBottom: 10,
//   },

//   imagePlaceholder: {
//     fontSize: 14,
//     color: '#777',
//   },

//   profileImage: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 10,
//   },

//   signUpButton: {
//     backgroundColor: '#007bff',
//     padding: 12,
//     borderRadius: 10,
//     alignItems: 'center',
//   },

//   signUpText: {
//     fontSize: 16,
//     color: '#FFF',
//     fontWeight: 'bold',
//   },
// });

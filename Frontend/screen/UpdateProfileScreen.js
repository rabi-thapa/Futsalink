import React, { useState, useContext, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // ✅ Added for refreshing on focus
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'react-native-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { AuthContext } from '../context/AuthContext';

const UpdateProfileScreen = () => {
  const navigation = useNavigation();
  const { userData, checkAuth } = useContext(AuthContext);

  const [profileDetails, setProfileDetails] = useState({
    firstName: '',
    lastName: '',
    gender: 'N/A',
    email: '',
    dateOfBirth: '',
    address: '',
  });

  const [profileImage, setProfileImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // ✅ Use useFocusEffect instead of useEffect to refresh data every time screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const loadProfileData = async () => {
        setLoading(true);
        try {
          await checkAuth(); // Triggers auth check and updates context
        } finally {
          setLoading(false);
        }
      };

      loadProfileData();
    }, [checkAuth])
  );

  // ✅ This effect only updates local state when userData changes (still needed)
  useEffect(() => {
    if (userData) {
      setProfileDetails({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        gender: userData.gender || 'N/A',
        email: userData.email || '',
        dateOfBirth: userData.dateOfBirth || '',
        address: userData.address || '',
      });

      setProfileImage(`http://10.0.2.2:3000/${userData.profileImage}`);
    }
  }, [userData]);

  const handleChange = (key, value) => {
    setProfileDetails(prev => ({ ...prev, [key]: value }));
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirmDate = date => {
    handleChange('dateOfBirth', date.toISOString());
    hideDatePicker();
  };

  const formatDisplayDate = dateString => {
    return dateString ? moment(dateString).format('YYYY-MM-DD') : 'Select Date';
  };

  const updateProfile = async () => {
    const { firstName, lastName, email, dateOfBirth } = profileDetails;

    // Basic frontend validation
    if (!firstName.trim()) {
      Alert.alert('Validation Error', 'First name is required');
      return;
    }

    if (!lastName.trim()) {
      Alert.alert('Validation Error', 'Last name is required');
      return;
    }

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    if (dateOfBirth && !moment(dateOfBirth, moment.ISO_8601, true).isValid()) {
      Alert.alert('Validation Error', 'Please select a valid date of birth');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error('User not authenticated');

      const response = await fetch(
        'http://10.0.2.2:3000/api/user/updateAccountDetails',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileDetails),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setProfileImage(
        `http://10.0.2.2:3000/${data.profileImage}?t=${Date.now()}`
      );
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const updateProfileImage = async () => {
    ImagePicker.launchImageLibrary({ mediaType: 'photo' }, async response => {
      if (response.didCancel || response.error) {
        Alert.alert('Error', 'Image selection failed');
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0];
        const formData = new FormData();
        formData.append('profileImage', {
          uri: selectedImage.uri,
          type: selectedImage.type,
          name: selectedImage.fileName || 'profile.jpg',
        });

        setLoading(true);
        try {
          const token = await AsyncStorage.getItem('accessToken');
          if (!token) throw new Error('User not authenticated');

          const res = await fetch(
            'http://10.0.2.2:3000/api/user/updateProfileImage',
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
              body: formData,
            }
          );

          const data = await res.json();

          if (!res.ok)
            throw new Error(data.message || 'Failed to update image');

          setProfileImage(
            `http://10.0.2.2:3000/${data.profileImage}?t=${Date.now()}`
          );

          await checkAuth(); // Refresh user data after image change
          Alert.alert('Success', 'Profile image updated successfully!');
        } catch (error) {
          Alert.alert(
            'Error',
            error.message || 'Failed to update profile image.'
          );
        } finally {
          setLoading(false);
        }
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2962FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.imageContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>No Image</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.imageButton}
            onPress={updateProfileImage}>
            <Text style={styles.imageButtonText}>Update Image</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          {Object.keys(profileDetails).map(key => (
            <View key={key} style={styles.formField}>
              <Text style={styles.label}>{key.replace(/([A-Z])/g, ' $1')}</Text>
              {key === 'dateOfBirth' ? (
                <>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={showDatePicker}>
                    <Text>{formatDisplayDate(profileDetails.dateOfBirth)}</Text>
                  </TouchableOpacity>
                  <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    date={
                      profileDetails.dateOfBirth
                        ? new Date(profileDetails.dateOfBirth)
                        : new Date()
                    }
                    onConfirm={handleConfirmDate}
                    onCancel={hideDatePicker}
                    maximumDate={new Date()}
                  />
                </>
              ) : (
                <TextInput
                  style={styles.input}
                  value={profileDetails[key]}
                  onChangeText={value => handleChange(key, value)}
                />
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.saveButton} onPress={updateProfile}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UpdateProfileScreen;

// ✅ Styles unchanged — same as before
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#666',
  },
  imageButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#66BB6A',
    borderRadius: 8,
  },
  imageButtonText: {
    color: '#fff',
  },
  formContainer: {
    marginTop: 10,
  },
  formField: {
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#66BB6A',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
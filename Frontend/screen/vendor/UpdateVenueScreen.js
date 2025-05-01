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
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VenueContext } from '../../context/VenueContext';
import * as ImagePicker from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker';

const UpdateVenueScreen = ({ route }) => {
  const { venueId } = route.params || {};
  console.log('Venue ID:', venueId);
  const { selectedVenue, fetchVenueById } = useContext(VenueContext);
  const navigation = useNavigation();

  const [venueDetails, setVenueDetails] = useState({
    venueName: '',
    location: {
      locationName: '',
      latitude: '',
      longitude: '',
    },
    description: '',
    pricePerHour: '',
    type: '',
    openingHours: { open: '', close: '' },
    status: '',
  });

  const [venueImage, setVenueImage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (venueId) {
      fetchVenueById(venueId);
    }
  }, []);

  useEffect(() => {
    if (!selectedVenue) {
      console.warn('Selected Venue is null or undefined');
      return;
    }
    setVenueDetails({
      venueName: selectedVenue.venueName || '',
      location: {
        locationName: selectedVenue.location?.locationName || '',
        latitude: selectedVenue.location?.latitude?.toString() || '',
        longitude: selectedVenue.location?.longitude?.toString() || '',
      },
      description: selectedVenue.description || '',
      pricePerHour: selectedVenue.pricePerHour?.toString() || '',
      type: selectedVenue.type || 'indoor',
      openingHours: {
        open: selectedVenue.openingHours?.open || '',
        close: selectedVenue.openingHours?.close || '',
      },
      status: selectedVenue.status?.toString() || '',
    });
    setVenueImage(`http://10.0.2.2:3000/${selectedVenue.venueImage}`);
  }, [selectedVenue]);

  const handleChange = (key, value) => {
    setVenueDetails((prev) => {
      if (key === 'openingHours') {
        return { ...prev, [key]: value };
      }
      return { ...prev, [key]: value };
    });
  };

  const updateVenue = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('User not authenticated');
      }
      const formattedData = {
        ...venueDetails,
        pricePerHour: Number(venueDetails.pricePerHour),
        status: Number(venueDetails.status),
        location: {
          ...venueDetails.location,
          latitude: parseFloat(venueDetails.location.latitude),
          longitude: parseFloat(venueDetails.location.longitude),
        },
      };
      const response = await fetch(
        `http://10.0.2.2:3000/api/venue/venueDetails/${venueId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formattedData),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update venue');
      }
      Alert.alert('Success', 'Venue updated successfully!');
      fetchVenueById(venueId);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update venue.');
    } finally {
      setLoading(false);
    }
  };

  const updateVenueImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibrary({ mediaType: 'photo' });
      if (result.didCancel) {
        return;
      }
      if (result.errorCode) {
        throw new Error(result.errorMessage || 'Image selection failed');
      }
      if (result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        const formData = new FormData();
        formData.append('venueImage', {
          uri: selectedImage.uri,
          type: selectedImage.type,
          name: selectedImage.fileName || 'venue.jpg',
        });
        setLoading(true);
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          throw new Error('User not authenticated');
        }
        const res = await fetch(`http://10.0.2.2:3000/api/venue/venueImage/${venueId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to update image');
        }
        setVenueImage(`http://10.0.2.2:3000${data.venue.venueImage}`);
        Alert.alert('Success', 'Venue image updated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update venue image.');
    } finally {
      setLoading(false);
    }
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
        {/* Venue Image Section */}
        <View style={styles.imageContainer}>
          {venueImage ? (
            <Image source={{ uri: venueImage }} style={styles.venueImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>No Image</Text>
            </View>
          )}
          <TouchableOpacity style={styles.imageButton} onPress={updateVenueImage}>
            <Text style={styles.imageButtonText}>Update Image</Text>
          </TouchableOpacity>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          {Object.entries(venueDetails).map(([key, value]) => {
            if (key === 'openingHours') {
              return (
                <View key={key}>
                  <Text style={styles.label}>Opening Time</Text>
                  <TextInput
                    style={styles.input}
                    value={value.open}
                    onChangeText={(val) => handleChange(key, { ...value, open: val })}
                  />
                  <Text style={styles.label}>Closing Time</Text>
                  <TextInput
                    style={styles.input}
                    value={value.close}
                    onChangeText={(val) => handleChange(key, { ...value, close: val })}
                  />
                </View>
              );
            } else if (key === 'location') {
              return (
                <View key={key}>
                  <Text style={styles.label}>Location Name</Text>
                  <TextInput
                    style={styles.input}
                    value={value.locationName}
                    onChangeText={(val) =>
                      handleChange('location', { ...value, locationName: val })
                    }
                  />
                  <Text style={styles.label}>Latitude</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={value.latitude}
                    onChangeText={(val) =>
                      handleChange('location', { ...value, latitude: val })
                    }
                  />
                  <Text style={styles.label}>Longitude</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={value.longitude}
                    onChangeText={(val) =>
                      handleChange('location', { ...value, longitude: val })
                    }
                  />
                </View>
              );
            } else if (key === 'type') {
              return (
                <View key={key}>
                  <Text style={styles.label}>Type</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={venueDetails.type || 'indoor'}
                      onValueChange={(itemValue) => handleChange('type', itemValue)}
                      style={styles.picker}>
                      <Picker.Item label="Indoor" value="indoor" />
                      <Picker.Item label="Outdoor" value="outdoor" />
                    </Picker>
                  </View>
                </View>
              );
            } else if (key === 'status') {
              return (
                <View key={key}>
                  <Text style={styles.label}>Status</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={venueDetails.status.toString()}
                      onValueChange={(itemValue) => handleChange('status', itemValue)}
                      style={styles.picker}>
                      <Picker.Item label="Active" value="1" />
                      <Picker.Item label="Not Active" value="0" />
                      <Picker.Item label="Under Maintenance" value="-1" />
                    </Picker>
                  </View>
                </View>
              );
            } else {
              return (
                <View key={key}>
                  <Text style={styles.label}>{key.replace(/([A-Z])/g, ' $1')}</Text>
                  <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={(val) => handleChange(key, val)}
                  />
                </View>
              );
            }
          })}

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={updateVenue}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UpdateVenueScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContainer: { flexGrow: 1, padding: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: { alignItems: 'center', marginBottom: 10 },
  venueImage: { width: 200, height: 150, borderRadius: 10 },
  imageButton: {
    marginTop: 5,
    backgroundColor: 'blue',
    padding: 6,
    borderRadius: 5,
  },
  imageButtonText: { color: 'white', fontSize: 14 },
  formContainer: { marginBottom: 15 },
  label: { fontSize: 14, color: '#333', marginBottom: 5 },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#FFF',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#FFF',
  },
  picker: {
    height: 50,
  },
  saveButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: { color: '#FFF', fontSize: 17 },
});
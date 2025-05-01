import React, {useState} from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, TextInput,
  Pressable, ScrollView, Image, Alert
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {useNavigation} from '@react-navigation/native';
import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddVenueScreen = () => {
  const [venueName, setVenueName] = useState('');
  const [location, setLocation] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [openingHours, setOpeningHours] = useState({ open: '', close: '' });
  const [venueImage, setVenueImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const VENUE_ENDPOINT = Config.VENUE_ENDPOINT;

  const selectVenueImage = () => {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (!response.didCancel && response.assets?.length > 0) {
        setVenueImage(response.assets[0]);
      }
    });
  };

  const handleAddVenue = async () => {
    if (!venueName || !location ||  !pricePerHour || !openingHours.open || !openingHours.close) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    const accessToken = await AsyncStorage.getItem('accessToken');

    const formData = new FormData();
    formData.append('venueName', venueName);
    formData.append('location', location);
   
    formData.append('pricePerHour', pricePerHour);
    formData.append('openingHours[open]', openingHours.open);
    formData.append('openingHours[close]', openingHours.close);

    if (venueImage) {
      formData.append('venueImage', {
        uri: venueImage.uri,
        type: venueImage.type || 'image/jpeg',
        name: venueImage.fileName || `venue_${Date.now()}.jpg`,
      });
    }

    try {
      const response = await fetch(`${VENUE_ENDPOINT}/addVenue`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Adding Venue Failed');
      }

      await AsyncStorage.setItem('venueId', data.venueId);
      Alert.alert('Success', 'Venue Added successfully!');
      navigation.navigate('VendorMain');
    } catch (error) {
      console.error('Error adding venue:', error);
      Alert.alert('Error', 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView>
      <SafeAreaView style={styles.container}>
        <View style={styles.innerContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Venue Name *</Text>
            <TextInput style={styles.input} placeholder="Venue Name" value={venueName} onChangeText={setVenueName} />

            <Text style={styles.label}>Location *</Text>
            <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />

          

            <Text style={styles.label}>Price per Hour *</Text>
            <TextInput style={styles.input} placeholder="1500" value={pricePerHour} onChangeText={setPricePerHour} keyboardType="numeric" />

            <Text style={styles.label}>Opening Time *</Text>
            <TextInput
              style={styles.input}
              placeholder="08:00"
              value={openingHours.open}
              onChangeText={(value) => setOpeningHours({ ...openingHours, open: value })}
            />

            <Text style={styles.label}>Closing Time *</Text>
            <TextInput
              style={styles.input}
              placeholder="22:00"
              value={openingHours.close}
              onChangeText={(value) => setOpeningHours({ ...openingHours, close: value })}
            />

            <Text style={styles.label}>Venue Image *</Text>
            <Pressable style={styles.imagePicker} onPress={selectVenueImage}>
              {venueImage ? (
                <Image source={{ uri: venueImage.uri }} style={styles.venueImage} />
              ) : (
                <Text style={styles.imagePlaceholder}>Select Image</Text>
              )}
            </Pressable>

            <Pressable style={styles.addButton} onPress={handleAddVenue}>
              <Text style={styles.addButtonText}>+ Add Venue</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },
  innerContainer: {
    paddingHorizontal: 8,
  },
  inputContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    elevation: 3,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 10,
    color: 'black',
  },
  input: {
    padding: 10,
    borderColor: '#D0D0D0',
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 15,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  imagePicker: {
    height: 100,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    marginTop: 10,
  },
  imagePlaceholder: {
    fontSize: 14,
    color: '#777',
  },
  venueImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 7,
    alignItems: 'center',
    marginTop: 15,
    width: '30%',
  },
  addButtonText: {
    fontSize: 15,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default AddVenueScreen;

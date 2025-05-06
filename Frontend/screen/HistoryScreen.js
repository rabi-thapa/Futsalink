import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import VenueCard from '../components/VenueCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HistoryScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserBookings = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      console.log('Token:', token);

      const response = await fetch('http://10.0.2.2:3000/api/bookings/my-bookings', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text(); // Avoid crash from invalid JSON
      console.log('Raw response text:', text);

      // Try parsing JSON manually
      try {
        const data = JSON.parse(text);
        console.log('Parsed bookings data:', data);

        if (response.ok) {
          const transformed = data.bookings
            .filter(booking => booking.venue) // Ensure venue exists
            .map(booking => ({
              id: booking._id,
              name: booking.venue?.venueName || 'Unknown Venue',
              image: booking.venue?.venueImage
                ? `http://10.0.2.2:3000/${booking.venue.venueImage}`
                : 'https://via.placeholder.com/150', // Fallback image
              address: booking.venue?.location?.locationName || 'Unknown Location',
              location: booking.venue?.location?.locationName || 'Unknown Location',
              rating: 4,
              timings: `${booking.startTime} - ${booking.endTime}`,
              sportsAvailable: [],
              bookings: booking,
            }));

          setBookings(transformed);
        } else {
          console.error('Failed to fetch bookings:', data.message);
        }
      } catch (jsonErr) {
        console.error('Failed to parse JSON from server response:', jsonErr);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserBookings();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Text>Shree Nagar</Text>
          <MaterialIcons name="keyboard-arrow-down" size={24} color="black" />
        </View>

        <View style={styles.headerIcons}>
          <Ionicons name="chatbox-outline" size={24} color="black" />
          <Ionicons name="notifications-outline" size={24} color="black" />
          <Image
            style={styles.profileImage}
            source={{
              uri: 'https://lh3.google.com/u/0/ogw/AF2bZygjrlW_ZIJ-BRImu6QyctOAqYdbM2iW0ug4BMC66W3y7Q=s64-c-mo',
            }}
          />
        </View>
      </View>

      <Pressable style={styles.filterContainer}>
        <View style={styles.filterBox}>
          <Text>Sports & Availability</Text>
        </View>
        <View style={styles.filterBox}>
          <Text>Favorites</Text>
        </View>
        <View style={styles.filterBox}>
          <Text>Offers</Text>
        </View>
      </Pressable>

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{marginTop: 20}} />
      ) : bookings.length === 0 ? (
        <Text style={styles.noBookingsText}>No bookings available</Text>
      ) : (
        <FlatList
          data={bookings}
          renderItem={({item}) => <VenueCard item={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d5d8dc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 13,
  },
  filterBox: {
    padding: 10,
    borderRadius: 10,
    borderColor: '#e0e0e0',
    borderWidth: 1,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  noBookingsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});
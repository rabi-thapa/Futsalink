import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import VenueCard from '../components/VenueCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const HistoryScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const controller = new AbortController();

      const fetchUserBookings = async () => {
        try {
          const token = await AsyncStorage.getItem('accessToken');
          if (!token) {
            console.error('Access token is missing');
            return;
          }

          const response = await fetch('http://10.0.2.2:3000/api/bookings/my-bookings', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();

          if (isActive && data.bookings) {
            const transformed = data.bookings
              .filter(booking => booking.venue)
              .map(booking => ({
                id: booking._id,
                name: booking.venue?.venueName || 'Unknown Venue',
                image: booking.venue?.venueImage
                  ? `http://10.0.2.2:3000/${booking.venue.venueImage}`
                  : 'https://via.placeholder.com/150',
                address: booking.venue?.location?.locationName || 'Unknown Location',
                location: booking.venue?.location?.locationName || 'Unknown Location',
                rating: 4,
                timings: `${booking.startTime} - ${booking.endTime}`,
                sportsAvailable: [],
                bookings: booking,
              }));

            setBookings(transformed);
          }
        } catch (err) {
          if (err.name === 'AbortError') {
            console.log('Fetch aborted');
          } else {
            console.error('Error fetching bookings:', err);
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      fetchUserBookings();

      return () => {
        isActive = false;
        controller.abort();
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
  <View style={styles.locationContainer}>
    <Text style={styles.headerText}>Booking History</Text>
  </View>
</View>


      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
      ) : bookings.length === 0 ? (
        <Text style={styles.noBookingsText}>No bookings available</Text>
      ) : (
        <FlatList
          data={bookings}
          renderItem={({ item }) => <VenueCard item={item} />}
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
    fontSize: '18'
  },

  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
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

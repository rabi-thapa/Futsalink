import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const screenWidth = Dimensions.get('window').width;

const VenuePeakHourDetailScreen = ({ route }) => {
  const { hour } = route.params;
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const res = await axios.get(
          `http://10.0.2.2:3000/api/dashboard/peak-hour-bookings?startTime=${hour}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBookings(res.data.bookings);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [hour]);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  if (!bookings.length) return <Text style={styles.noDataText}>No bookings found</Text>;

  const renderBooking = ({ item }) => (
    <LinearGradient
      colors={['#6a11cb', '#2575fc']}
      style={styles.bookingCard}
    >
      <Text style={styles.bookingTitle}><Icon name="map-marker" size={18} color="#fff" /> {item.venueName}</Text>
      <Text style={styles.bookingDetail}><Icon name="account" size={16} color="#fff" /> {item.user}</Text>
      <Text style={styles.bookingDetail}><Icon name="calendar" size={16} color="#fff" /> {new Date(item.date).toLocaleDateString()}</Text>
      <Text style={styles.bookingDetail}><Icon name="clock-outline" size={16} color="#fff" /> {item.duration}</Text>
      <Text style={styles.bookingPrice}>₹{item.price}</Text>
    </LinearGradient>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>⏰ Peak Hour: {hour}</Text>

      <LinearGradient colors={['#00b09b', '#96c93d']} style={styles.card}>
        <Icon name="format-list-numbered" size={28} color="#fff" />
        <Text style={styles.label}>Total Bookings</Text>
        <Text style={styles.value}>{bookings.length}</Text>
      </LinearGradient>

      <Text style={styles.subHeader}>📋 Booking Details</Text>
      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f4f7',
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#34495e',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 5,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginTop: 8,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 4,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2c3e50',
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  bookingTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  bookingDetail: {
    fontSize: 14,
    color: '#e0e0e0',
    marginBottom: 2,
  },
  bookingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffd700',
    marginTop: 8,
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#7f8c8d',
    marginTop: 50,
  },
});

export default VenuePeakHourDetailScreen;

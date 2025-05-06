import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Dimensions, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const screenWidth = Dimensions.get('window').width;

const VenueDetailScreen = ({ route }) => {
  const { venueId } = route.params;
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenueDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const res = await axios.get(
          `http://10.0.2.2:3000/api/venue/${venueId}/revenue`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setVenue(res.data.data);
      } catch (err) {
        console.error('Error fetching venue details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVenueDetails();
  }, [venueId]);

  if (loading) return <ActivityIndicator size="large" />;
  if (!venue) return <Text>No venue data found</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>{venue.venueName || 'Unnamed Venue'}</Text>

     
      <LinearGradient colors={['#2ecc71', '#27ae60']} style={styles.card}>
        <Icon name="currency-inr" size={30} color="#fff" />
        <Text style={styles.label}>Total Revenue</Text>
        <Text style={styles.value}>₹{venue.totalRevenue || 0}</Text>
      </LinearGradient>

      <LinearGradient colors={['#3498db', '#2980b9']} style={styles.card}>
        <Icon name="calendar-multiselect" size={30} color="#fff" />
        <Text style={styles.label}>Total Bookings</Text>
        <Text style={styles.value}>{venue.bookingCount || 0}</Text>
      </LinearGradient>

      <LinearGradient colors={['#9b59b6', '#8e44ad']} style={styles.card}>
        <Icon name="chart-box-outline" size={30} color="#fff" />
        <Text style={styles.label}>Avg. Booking Value</Text>
        <Text style={styles.value}>₹{(venue.averageRevenuePerBooking || 0).toFixed(2)}</Text>
      </LinearGradient>


      <Text style={styles.chartTitle}>📊 Revenue Summary</Text>
      <BarChart
        data={{
          labels: ['Revenue', 'Avg Value'],
          datasets: [
            {
              data: [
                venue.totalRevenue || 0,
                venue.averageRevenuePerBooking || 0,
              ],
            },
          ],
        }}
        width={screenWidth - 40}
        height={220}
        yAxisLabel="₹"
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(26, 188, 156, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 16 },
        }}
        style={{ marginVertical: 8, borderRadius: 16 }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F5F5F5',
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    elevation: 5,
    flexDirection: 'column',
    alignItems: 'center',
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
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
});

export default VenueDetailScreen;


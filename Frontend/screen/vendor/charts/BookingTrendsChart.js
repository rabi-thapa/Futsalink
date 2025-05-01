import React, { useEffect, useState } from 'react';
import { LineChart } from 'react-native-chart-kit';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BookingTrendsChart = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchBookingTrends = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          console.error('Access token is missing');
          setData({
            labels: ['Error'],
            datasets: [{ data: [0] }],
          });
          return;
        }

        const response = await fetch('http://10.0.2.2:3000/api/dashboard/booking-trends', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log('API Response for Booking Trends:', response.data); // Debugging log

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Fetched booking trends:", result);

        if (!result || !result.datasets || result.datasets[0].data.length === 0) {
          console.warn('No booking trends data available.');
          setData({
            labels: ['No Data'],
            datasets: [{ data: [0] }],
          });
        } else {
          setData(result);
        }
      } catch (error) {
        console.error('Error fetching booking trends:', error.message || error);
        setData({
          labels: ['Error'],
          datasets: [{ data: [0] }],
        });
      }
    };

    fetchBookingTrends();
  }, []);

  if (!data || !Array.isArray(data.labels) || !Array.isArray(data.datasets)) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Booking Trends</Text>
      <LineChart
        data={data}
        width={Math.min(350, Dimensions.get('window').width - 20)}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    marginVertical: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default BookingTrendsChart;
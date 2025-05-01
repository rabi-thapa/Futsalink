import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VenuePopularityChart = () => {
  const [venuePopularityData, setVenuePopularityData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVenuePopularityData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const response = await axios.get('http://10.0.2.2:3000/api/dashboard/venue-popularity', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Validate response data
        if (!response.data || !Array.isArray(response.data.labels) || !response.data.datasets) {
          throw new Error('Invalid data format from server');
        }

        // Modify labels to show only the first name of each venue
        const modifiedLabels = response.data.labels.map(label => label.split(' ')[0]);

        // Update the state with modified labels
        setVenuePopularityData({
          ...response.data,
          labels: modifiedLabels,
        });
      } catch (error) {
        console.error('Error fetching venue popularity data:', error);
        setError('Failed to load venue popularity data.');
      } finally {
        setLoading(false);
      }
    };

    fetchVenuePopularityData();
  }, []);

  // Fallback UI for loading state
  if (loading) {
    return (
      <View style={{ marginVertical: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>Venue Popularity</Text>
        <Text style={{ textAlign: 'center', marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  // Fallback UI for error state
  if (error) {
    return (
      <View style={{ marginVertical: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>Venue Popularity</Text>
        <Text style={{ textAlign: 'center', marginTop: 10, color: 'red' }}>{error}</Text>
      </View>
    );
  }

  // Fallback UI for no data
  if (venuePopularityData.labels.length === 0 || venuePopularityData.datasets[0].data.length === 0) {
    return (
      <View style={{ marginVertical: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>Venue Popularity</Text>
        <Text style={{ textAlign: 'center', marginTop: 10 }}>No venue popularity data available.</Text>
      </View>
    );
  }

  return (
    <View style={{ marginVertical: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>Venue Popularity</Text>
      <BarChart
        data={venuePopularityData}
        width={350}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          strokeWidth: 2,
        }}
        style={{ marginVertical: 8 }}
      />
    </View>
  );
};

export default VenuePopularityChart;
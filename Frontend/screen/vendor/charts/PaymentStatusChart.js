import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PaymentStatusChart = () => {
  const [paymentStatusData, setPaymentStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaymentStatusData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const response = await axios.get('http://10.0.2.2:3000/api/dashboard/payment-status', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Validate response data
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid data format from server');
        }

        // Format data for PieChart
        const formattedData = response.data.map((item, index) => ({
          name: item.name,
          population: item.population,
          color: item.color,
          legendFontColor: '#7F7F7F',
          legendFontSize: 15,
        }));

        setPaymentStatusData(formattedData);
      } catch (error) {
        console.error('Error fetching payment status data:', error);
        setError('Failed to load payment status data.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatusData();
  }, []);

  // Fallback UI for loading state
  if (loading) {
    return (
      <View style={{ marginVertical: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>Payment Status Distribution</Text>
        <Text style={{ textAlign: 'center', marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  // Fallback UI for error state
  if (error) {
    return (
      <View style={{ marginVertical: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>Payment Status Distribution</Text>
        <Text style={{ textAlign: 'center', marginTop: 10, color: 'red' }}>{error}</Text>
      </View>
    );
  }

  // Fallback UI for no data
  if (paymentStatusData.length === 0) {
    return (
      <View style={{ marginVertical: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>Payment Status Distribution</Text>
        <Text style={{ textAlign: 'center', marginTop: 10 }}>No payment status data available.</Text>
      </View>
    );
  }

  return (
    <View style={{ marginVertical: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>Payment Status Distribution</Text>
      <PieChart
        data={paymentStatusData}
        width={350}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </View>
  );
};

export default PaymentStatusChart;
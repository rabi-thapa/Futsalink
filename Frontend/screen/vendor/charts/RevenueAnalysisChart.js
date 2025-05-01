import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RevenueAnalysisChart = () => {
  const [revenueData, setRevenueData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const response = await axios.get('http://10.0.2.2:3000/api/dashboard/revenue-analysis', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('API Response for Revenue Analysis:', response.data); // Debugging log

        const formattedData = {
          labels: response.data.labels || ['No Data'], // Fallback for labels
          datasets: response.data.datasets && response.data.datasets.length > 0
            ? response.data.datasets.map(dataset => ({ data: dataset.data }))
            : [{ data: [0] }], // Fallback for datasets
        };

        console.log('Formatted Revenue Data:', formattedData); // Debugging log
        setRevenueData(formattedData);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      }
    };
    fetchRevenueData();
  }, []);

  return (
    <View style={{ marginVertical: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>Revenue Analysis</Text>
      {revenueData.labels.length > 0 && revenueData.datasets[0].data.length > 0 ? (
        <LineChart
          data={revenueData}
          width={350}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            strokeWidth: 2,
            barPercentage: 0.5,
          }}
          bezier
          style={{ marginVertical: 8 }}
        />
      ) : (
        <Text style={{ textAlign: 'center', marginTop: 10 }}>No revenue data available</Text>
      )}
    </View>
  );
};

export default RevenueAnalysisChart;
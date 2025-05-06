import React, { useEffect, useState } from 'react';
import { LineChart } from 'react-native-chart-kit';
import { StyleSheet, Text, View, Dimensions, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';

const BookingTrendsChart = () => {
  const [data, setData] = useState(null);
  const [venueId, setVenueId] = useState(null);

  // DropDownPicker state
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('month');
  const [items, setItems] = useState([
    { label: 'Weekly', value: 'week' },
    { label: 'Monthly', value: 'month' },
    { label: 'Yearly', value: 'year' },
  ]);

  useEffect(() => {
    const fetchBookingTrends = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          setData({
            labels: ['Error'],
            datasets: [{ data: [0] }],
          });
          return;
        }

        const queryParams = new URLSearchParams();
        queryParams.append('granularity', value);
        if (venueId) queryParams.append('venueId', venueId);

        const response = await fetch(
          `http://10.0.2.2:3000/api/dashboard/booking-trends?${queryParams}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (!result || !result.datasets || result.datasets[0].data.length === 0) {
          setData({
            labels: ['No Data'],
            datasets: [{ data: [0] }],
          });
        } else {
          const modifiedLabels = result.labels.map((label) =>
            value === 'week' && label.startsWith('Week') ? `W ${label.split(' ')[1]}` : label
          );
          setData({ ...result, labels: modifiedLabels });
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
  }, [value, venueId]);

  if (!data || !Array.isArray(data.labels) || !Array.isArray(data.datasets)) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Booking Trends</Text>

        <View style={styles.dropdownWrapperLeft}>
          <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={(val) => setValue(val())}
            setItems={setItems}
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            dropDownContainerStyle={styles.dropdownContainer}
            placeholder="Select"
            listMode="SCROLLVIEW"
          />
        </View>

        <LineChart
          data={data}
          width={Math.min(350, Dimensions.get('window').width - 20)}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#e0f2fe',

            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          bezier
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 10,
    backgroundColor: '#f0f4f8',
  },
  chartContainer: {
    marginVertical: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    borderRadius: 12,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 6,
    // elevation: 4,
  
  },
  chartTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e3a8a', 
    marginBottom: 16,
    textAlign: 'center',
  },
  dropdownWrapperLeft: {
    zIndex: 1000,
    marginBottom: 30,
    width: 180,
    paddingLeft: 4,
  },
  dropdown: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderRadius: 10,
    height: 45,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dropdownContainer: {
    borderColor: '#d1d5db',
    borderRadius: 12,
  },
  chart: {
    marginVertical: 7,
    borderRadius: 16,
  },
});

export default BookingTrendsChart;

import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Dimensions, ScrollView} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';

const RevenueAnalysisChart = () => {
  const [revenueData, setRevenueData] = useState(null);
  const [venueId, setVenueId] = useState(null);

  // DropDownPicker state
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('month');
  const [items, setItems] = useState([
    {label: 'Weekly', value: 'week'},
    {label: 'Monthly', value: 'month'},
    {label: 'Yearly', value: 'year'},
  ]);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          console.error('Access token is missing');
          setRevenueData({
            labels: ['Error'],
            datasets: [{data: [0]}],
          });
          return;
        }

        const queryParams = new URLSearchParams();
        queryParams.append('granularity', value);
        if (venueId) queryParams.append('venueId', venueId);

        const response = await fetch(
          `http://10.0.2.2:3000/api/dashboard/revenue-analysis?${queryParams}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (
          !result ||
          !result.datasets ||
          result.datasets[0].data.length === 0
        ) {
          console.warn('No revenue data available.');
          setRevenueData({
            labels: ['No Data'],
            datasets: [{data: [0]}],
          });
        } else {
          setRevenueData(result);
        }
      } catch (error) {
        console.error('Error fetching revenue data:', error.message || error);
        setRevenueData({
          labels: ['Error'],
          datasets: [{data: [0]}],
        });
      }
    };

    fetchRevenueData();
  }, [value, venueId]);

  if (
    !revenueData ||
    !Array.isArray(revenueData.labels) ||
    !Array.isArray(revenueData.datasets)
  ) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Revenue Analysis</Text>

        <View style={styles.dropdownWrapperLeft}>
          <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={val => setValue(val())}
            setItems={setItems}
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            dropDownContainerStyle={styles.dropdownContainer}
            placeholder="Select"
            listMode="SCROLLVIEW"
          />
        </View>

        <LineChart
          data={revenueData}
          width={Math.min(350, Dimensions.get('window').width - 20)}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`,
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
    paddingBottom: 30,
  },
  chartContainer: {
    marginVertical: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#f4f6f8',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  dropdownWrapper: {
    zIndex: 1000,
    marginBottom: 20,
    width: 180,
    paddingLeft: 4,
  },

  dropdownWrapperLeft: {
    zIndex: 1000,
    marginBottom: 20,
    width: 180,
    paddingLeft: 4, 
  },

  dropdown: {
    backgroundColor: '#ffffff',
    borderColor: '#ccc',
    borderRadius: 10,
    height: 45,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#016396',
  },
  dropdownContainer: {
    borderColor: '#ccc',
    borderRadius: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default RevenueAnalysisChart;

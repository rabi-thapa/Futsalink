// screens/DashBoardScreen.js
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BookingTrendsChart from './charts/BookingTrendsChart';
import RevenueAnalysisChart from './charts/RevenueAnalysisChart';
import  VenuePeakHoursChart from './charts/VenuePeakHoursChart';
import VenuePopularityChart from './charts/VenuePopularityChart';

const DashBoardScreen = ({ navigation }) => {
  navigation=  useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <VenuePopularityChart navigation={navigation} />
      <BookingTrendsChart />
      <RevenueAnalysisChart />
      <VenuePeakHoursChart navigation={navigation}  />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
});

export default DashBoardScreen;
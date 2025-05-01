// screens/DashBoardScreen.js
import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import BookingTrendsChart from './charts/BookingTrendsChart';
import RevenueAnalysisChart from './charts/RevenueAnalysisChart';
import PaymentStatusChart from './charts/PaymentStatusChart';
import VenuePopularityChart from './charts/VenuePopularityChart';

const DashBoardScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BookingTrendsChart />
      <RevenueAnalysisChart />
      <PaymentStatusChart/>
      <VenuePopularityChart/>
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

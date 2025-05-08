import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const VenuePeakHoursChart = ({ navigation }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPeakHours = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const res = await axios.get("http://10.0.2.2:3000/api/dashboard/peak-hours", {
          headers: { Authorization: `Bearer ${token}` }
        });

       
        const colors = [
            "#6366F1", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EF4444", "#06B6D4"
          ];

          const formattedData = res.data.data.map((item, index) => ({
            value: item.bookings,
            label: item.hour,
            onPress: () => {
              navigation.navigate("VenuePeakHourDetail", { hour: item.hour });
            },
            frontColor: colors[index % colors.length],
            gradientColor: `${colors[index % colors.length]}88`, // semi-transparent
          }));

        setChartData(formattedData);
      } catch (err) {
        console.error("Error fetching peak hours:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPeakHours();
  }, []);

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View style={styles.container}>
       <Text style={styles.title}>📊 Peak Booking Hours
       Peak Booking Hours (All Venues)
      </Text>
     
      <BarChart
      width={350}
        data={chartData}
        barWidth={28}
        spacing={18}
        radius={6}
        yAxisThickness={0}
        xAxisThickness={0}
        hideRules
        isAnimated
        height={240}
        noOfSections={4}
        labelWidth={40}
        barBorderRadius={4}
      />
    </View>
  );
};

export default VenuePeakHoursChart;


const styles = StyleSheet.create({
    container: {
      margin: 16,
      padding: 16,
      backgroundColor: '#ffffff',
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 6,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: 16,
      textAlign: 'center',
    },
  });
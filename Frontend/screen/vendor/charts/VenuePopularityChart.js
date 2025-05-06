import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  ScrollView,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const VenuePopularityChart = ({ navigation }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    const fetchPopularity = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const res = await axios.get(
          "http://10.0.2.2:3000/api/dashboard/venue-popularity",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data && res.data.labels && res.data.datasets) {
          const labels = res.data.labels.map((label) => label.split(" ")[0]);
          const values = res.data.datasets[0].data;
          const ids = res.data.venueIds;

          const formattedData = labels.map((label, index) => ({
            value: values[index],
            label,
            venueId: ids[index],
            onPress: () => {
              navigation.navigate("VenueDetail", { venueId: ids[index] });
            },
            frontColor: "#3b82f6",
            gradientColor: "#60a5fa",
          }));

          setChartData(formattedData);
        }
      } catch (err) {
        console.error("Error fetching chart data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularity();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loaderText}>Loading chart...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.chartContainer}>
        <Text style={styles.title}>📊 Venue Popularity</Text>
        <BarChart
          data={chartData}
          barWidth={28}
          width={screenWidth - 32}

          spacing={34}
          initialSpacing={10}
          maxValue={Math.max(...chartData.map((item) => item.value)) + 5}
          xAxisLabelTextStyle={styles.xAxisLabel}
          yAxisTextStyle={styles.yAxisLabel}
          labelWidth={50}
          showScrollIndicator={false}
          hideYAxisText
          formatYLabel={(label) => `${label}`}
          isThreeD
          disablePress={false}
          roundedTop
          noOfSections={4}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 10,
    paddingHorizontal: 4,
  },
  chartContainer: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
    color: "#1f2937",
  },
  xAxisLabel: {
    color: "#4b5563",
    fontSize: 12,
    fontWeight: "500",
  },
  yAxisLabel: {
    color: "#6b7280",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    marginTop: 10,
    color: "#6b7280",
  },
});

export default VenuePopularityChart;

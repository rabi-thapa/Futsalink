import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import axiosInstance from '../../utils/axiosInstance';

const OrdersScreen = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/bookings/vendor-orders');
      console.log('Response Data:', response.data);

      if (response.data?.bookings) {
        setOrders(response.data.bookings);
      } else {
        console.error('Invalid response structure:', response.data);
        Alert.alert('Error', 'Failed to load orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error.message || error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, []),
  );

  const renderItem = ({item}) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Image
          source={{uri: `http://10.0.2.2:3000/${item.venue.venueImage}`}}
          style={styles.venueImage}
          resizeMode="cover"
        />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.venueName} numberOfLines={1}>
              {item.venue?.venueName || 'Unnamed Venue'}
            </Text>
          </View>
          <Text style={styles.textLabel}>
            Booked By:{' '}
            <Text style={styles.textValue}>
              {item.user?.firstName || ''} {item.user?.lastName || ''}
            </Text>
          </Text>
          <Text style={styles.textLabel}>
            Date: <Text style={styles.textValue}>{item.date}</Text>
          </Text>
          <Text style={styles.textLabel}>
            Time:{' '}
            <Text style={styles.textValue}>
              {item.startTime} - {item.endTime}
            </Text>
          </Text>
          <Text style={styles.textLabel}>
            Total Price:{' '}
            <Text style={styles.textValue}>${item.totalPrice.toFixed(2)}</Text>
          </Text>

          <Text style={styles.status(item.paymentStatus)}>
            {item.paymentStatus || 'pending'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#4B7BE5" />
      ) : orders.length === 0 ? (
        <Text style={styles.noOrdersText}>No orders found.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

export default OrdersScreen;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FA',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  noOrdersText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
  listContainer: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  venueImage: {
    height: '90%',
    width: '45%',
    borderRadius: 12,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    paddingVertical: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  venueName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2B2B2B',
    flexShrink: 1,
  },
  status: status => ({
    fontSize: 14,
    fontWeight: 'bold',
    color:
      status === 'paid'
        ? '#4CAF50'
        : status === 'pending'
        ? '#FFA500'
        : '#F44336',
    textTransform: 'capitalize',
  }),
  textLabel: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  textValue: {
    fontWeight: '600',
    color: '#000',
  },
});

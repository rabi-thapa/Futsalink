import { Pressable, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

const VenueCard = ({ item }) => {
  const navigation = useNavigation();
  if (!item) return null;

  // Parse date
  const bookingDate = new Date(item.bookings?.date).toLocaleDateString();

  // Calculate duration in hours
  const getDuration = (start, end) => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startTime = startHour + startMin / 60;
    const endTime = endHour + endMin / 60;
    return (endTime - startTime).toFixed(1);
  };

  const duration = getDuration(item.bookings.startTime, item.bookings.endTime);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardInner}>
        <Image
          source={{
            uri: item.image?.startsWith('http')
              ? item.image
              : `http://10.0.2.2:3000/${item.image}`,
          }}
          style={styles.thumbnail}
        />

        <View style={styles.details}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.address} numberOfLines={1}>
            {item.address}
          </Text>

          <Text style={styles.info}>📅 Date: {bookingDate}</Text>
          <Text style={styles.info}>🕒 Time: {item.timings}</Text>
          <Text style={styles.info}>⏱ Duration: {duration} hour(s)</Text>
          <Text style={styles.status}>💳 Status: {item.bookings?.paymentStatus || 'unpaid'}</Text>
          <Text style={styles.price}>Total: NPR {item.bookings?.totalPrice || 0}</Text>

          <View style={styles.controlButtons}>
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() =>
                navigation.navigate('Review', {
                  venueId: item.bookings._id,
                  venueName: item.name,
                })
              }
            >
              <Text style={styles.reviewButtonText}>Review</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() =>
                navigation.navigate('CancelBooking', {
                  bookingId: item.id,
                  venueName: item.name,
                })
              }
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default VenueCard;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 8,
    marginVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    padding: 10,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  thumbnail: {
    width: '40%',
    aspectRatio: 1,
    borderRadius: 10,
    marginRight: 10,
  },
  details: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  info: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  status: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  reviewButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#66BB6A',
    borderRadius: 6,
  },
  reviewButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: 'red',
    borderRadius: 6,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});

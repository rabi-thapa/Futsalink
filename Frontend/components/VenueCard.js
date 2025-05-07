import { Pressable, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

const VenueCard = ({ item }) => {
  const navigation = useNavigation();
  if (!item) return null;

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardInner}>
        {/* Left: Image */}
        <Image
          source={{
            uri: item.image?.startsWith('http')
              ? item.image
              : `http://10.0.2.2:3000/${item.image}`,
          }}
          style={styles.thumbnail}
        />

        {/* Right: Info */}
        <View style={styles.details}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.address} numberOfLines={1}>
            {item.address}
          </Text>
          <Text style={styles.timing}>Booked: {item.timings}</Text>
          <Text style={styles.price}>NPR {item.bookings?.price || 1250}</Text>

          {/* Changed: Control buttons now in flex row */}
          <View style={styles.controlButtons}>
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() =>
                navigation.navigate('Review', {
                  venueId: item.bookings.venue._id,
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
                  venueId: item.bookings.venue._id,
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
    backgroundColor: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    marginHorizontal: 4,
    marginVertical: 8,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
    padding: 6,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  thumbnail: {
    width: '48%', 
    aspectRatio: 1, 
    borderRadius: 10,
    marginRight: 12,
  },
  details: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 17, // Changed: Slightly bigger
    fontWeight: '600',
    marginBottom: 2,
  },
  address: {
    color: '#666',
    fontSize: 15, // Changed: Slightly bigger
    marginBottom: 2,
  },
  timing: {
    fontSize: 15, // Changed: Slightly bigger
    color: '#333',
    marginBottom: 2,
  },
  status: {
    fontSize: 15, // Changed: Slightly bigger
    color: '#2e7d32',
    marginBottom: 2,
  },
  price: {
    fontSize: 16, // Changed: Slightly bigger
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 9,
  },

  controlButtons: {
    flexDirection: 'row', // Changed: Buttons aligned horizontally
    gap: 10, // Optional: spacing between buttons
  },
  reviewButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#66BB6A',
    borderRadius: 6,
    marginRight: 8,
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

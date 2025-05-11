import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';


const OffersScreen = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchDiscountedVenues = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://10.0.2.2:3000/api/venue?discounted=true');
      const data = await response.json();
      console.log('Discounted venues:', data);

      if (response.ok) {
        const transformed = data.venues
          .filter(venue => venue.discount && venue.discount.discountPercentage > 0)
          .map(venue => {
            const originalPrice = venue.pricePerHour;
            const discountedPrice = (
              originalPrice -
              (originalPrice * venue.discount.discountPercentage) / 100
            ).toFixed(2);

            return {
              id: venue._id,
              name: venue.venueName,
              image: `http://10.0.2.2:3000/${venue.venueImage}`,
              location: venue.location?.locationName || 'Unknown Location',
              discount: venue.discount,
              timings: `${venue.openingHours.open} - ${venue.openingHours.close}`,
              originalPrice,
              discountedPrice,
              venue,
            };
          });

        setOffers(transformed);
      } else {
        console.error('Failed to fetch discounted venues:', data.message);
      }
    } catch (err) {
      console.error('Error fetching discounted venues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountedVenues();
  }, []);

  const handlePress = (item) => {
    navigation.navigate('BookNow', {venueId: item.venue._id });
  };

  const renderItem = ({item}) => (
    <Pressable style={styles.card} onPress={() => handlePress(item)}>
      <Image source={{uri: item.image}} style={styles.image} />
      <View style={styles.cardInfo}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.location}>{item.location}</Text>
        <Text style={styles.discountText}>🎉 {item.discount.discountPercentage}% OFF</Text>
        <Text style={styles.timings}>🕒 {item.timings}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.originalPrice}>Rs. {item.originalPrice}</Text>
          <Text style={styles.discountedPrice}>Rs. {item.discountedPrice}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      
    

      <Text style={styles.heading}>Exclusive Offers 🎁</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{marginTop: 20}} />
      ) : offers.length === 0 ? (
        <Text style={styles.noOffersText}>No offers available</Text>
      ) : (
        <FlatList
          data={offers}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default OffersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#ccc',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileImage: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginLeft: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 15,
    marginLeft: 16,
    color: '#2c3e50',
  },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#aaa',
  },
  image: {
    width: '100%',
    height: 180,
  },
  cardInfo: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495e',
  },
  location: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  discountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e74c3c',
    marginTop: 6,
  },
  timings: {
    fontSize: 14,
    color: '#2980b9',
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  originalPrice: {
    fontSize: 16,
    color: '#e74c3c',
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  noOffersText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 18,
    color: '#7f8c8d',
  },
});

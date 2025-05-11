import React, {useContext, useCallback} from 'react';
import {
  ScrollView,
  Text,
  View,
  Image,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  ImageBackground,
  Button,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {VenueContext} from '../context/VenueContext';

const HomeScreen = () => {
  const navigation = useNavigation();
  const {venues, fetchVenues, loading} = useContext(VenueContext);

  useFocusEffect(
    useCallback(() => {
      console.log('✅ HomeScreen is focused');
      fetchVenues({page: 1, limit: 10});
      return () => {
        console.log('👋 HomeScreen lost focus');
      };
    }, []),
  );

  const discountedVenues = venues.filter(venue => venue.discountedPrice);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.findGroundContainer}>
        <Image
          style={styles.iconImage}
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/512/785/785116.png',
          }}
        />
        <View>
          <View style={styles.findGroundHeader}>
            <Text style={styles.findGroundText}>Find a Ground</Text>
            <Image
              style={styles.smallIcon}
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/128/785/785116.png',
              }}
            />
          </View>
          <Text style={styles.findGroundSubText}>
            Find and play at the best arenas near you
          </Text>
        </View>
      </View>

    

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Deals of the Day</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#17B169" />
        ) : discountedVenues.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}>
            {discountedVenues.map(venue => (
              <Pressable
                key={`${venue._id}-${venue.venueName}`}
                style={styles.dealCard}
                onPress={() =>
                  navigation.navigate('BookNow', {venueId: venue._id})
                }>
                <Image
                  source={{uri: `http://10.0.2.2:3000/${venue.venueImage}`}}
                  style={styles.dealImage}
                  onError={error =>
                    console.error('Image loading error:', error.nativeEvent)
                  }
                />
                <View style={styles.dealInfo}>
                  <Text numberOfLines={1} style={styles.dealName}>
                    {venue.venueName}
                  </Text>
                  <Text numberOfLines={1} style={styles.dealLocation}>
                    {venue.location?.locationName || 'Unknown Location'}
                  </Text>
                  <View style={styles.priceBlock}>
                    <Text style={styles.discountedPrice}>
                      NPR {venue.discountedPrice}/hr
                    </Text>
                    <Text style={styles.originalPrice}>
                      NPR {venue.pricePerHour}/hr
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <Text>No discounted venues available</Text>
        )}
      </View>

      <View style={styles.spotlightContainer}>
        <Text style={styles.spotlightTitle}>Spotlight</Text>
        {loading ? (
          <ActivityIndicator size="large" color="green" />
        ) : venues.length === 0 ? (
          <Text>No venues available</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {venues.map(venue => (
              <Pressable
                key={`${venue._id}-${venue.venueName}`}
                onPress={() =>
                  navigation.navigate('BookNow', {venueId: venue._id})
                }>
                <ImageBackground
                  imageStyle={styles.spotlightImage}
                  style={styles.spotlightItem}
                  source={{uri: `http://10.0.2.2:3000/${venue.venueImage}`}}
                  onError={error =>
                    console.error('Image loading error:', error.nativeEvent)
                  }>
                 

                  <View style={styles.spotlightOverlay}>
                    <View>
                      <Text style={styles.spotlightArenaName}>
                        {venue.venueName}
                      </Text>
                      <Text style={styles.spotlightLocation}>
                        {venue.location?.locationName || 'Unknown Location'}
                      </Text>
                    </View>

                    <View style={styles.spotlightPrice}>
                      {venue.discountedPrice ? (
                        <>
                          <Text style={styles.discountedPrice}>
                            Rs {venue.discountedPrice}/hour
                          </Text>
                          <Text style={styles.originalPrice}>
                            Rs {venue.pricePerHour}/hour
                          </Text>
                        </>
                      ) : (
                        <Text style={styles.discountedPrice}>
                          Rs {venue.pricePerHour}/hour
                        </Text>
                      )}
                    </View>

                    <Text style={styles.spotlightExtra}>
                      {venue.type?.toUpperCase()} | {venue.openingHours?.open} -{' '}
                      {venue.openingHours?.close}
                    </Text>
                  </View>
                </ImageBackground>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d5d8dc',
  },

  findGroundContainer: {
    padding: 8,
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconImage: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  findGroundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  findGroundText: {
    fontSize: 16,
    fontWeight: '600',
  },
  smallIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  findGroundSubText: {
    marginTop: 10,
    color: 'gray',
  },

  activityContainer: {
    padding: 13,
    backgroundColor: 'white',
    marginVertical: 6,
    marginHorizontal: 13,
    borderRadius: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityTitle: {
    fontSize: 16,
  },
  viewButton: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 7,
  },
  noGamesText: {
    marginTop: 4,
    color: 'gray',
  },
  calendarButton: {
    marginVertical: 20,
    alignSelf: 'center',
  },
  calendarText: {
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  sectionContainer: {
    padding: 13,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  horizontalScroll: {
    paddingVertical: 10,
  },
  dealCard: {
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginRight: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 6,
  },
  
  dealImage: {
    width: '100%',
    height: 100,
  },
  
  dealInfo: {
    padding: 10,
  },
  
  dealName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  
  dealLocation: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 8,
  },
  
  priceBlock: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  
  originalPrice: {
    color: 'red',
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    color: 'green',
    fontSize: 14,
    fontWeight: 'bold',
  },

  spotlightContainer: {
    padding: 13,
  },
  spotlightTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  spotlightItem: {
    width: 250,
    height: 300,
    marginRight: 12,
    marginVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  spotlightOverlay: {
    flex: 1,

    padding: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  spotlightArenaName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  spotlightLocation: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 2,
  },
  spotlightPrice: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: 10,
  },

  discountedPrice: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
  },

  originalPrice: {
    fontSize: 18,
    color: '#FF6961',
    textDecorationLine: 'line-through',
    fontWeight: 'bold',
  },

  spotlightExtra: {
    marginTop: 5,
    color: '#f0f0f0',
    fontSize: 16,
  },
});

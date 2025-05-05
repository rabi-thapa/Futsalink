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

  return (
    <ScrollView style={styles.container}>

      
      {/* <View style={styles.findGroundContainer}>
        <Image
          style={styles.iconImage}
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/785/785116.png' }}
        />
        <View>
          <View style={styles.findGroundHeader}>
            <Text style={styles.findGroundText}>Find a Ground</Text>
            <Image
              style={styles.smallIcon}
              source={{ uri: 'https://cdn-icons-png.flaticon.com/128/785/785116.png' }}
            />
          </View>
          <Text style={styles.findGroundSubText}>Find and play at the best arenas near you</Text>
        </View>
      </View>  */}

      <View style={styles.activityContainer}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle}>Futsal Activity</Text>
          <Pressable style={styles.viewButton}>
            <Button title="VIEW" />
          </Pressable>
        </View>
        <Text style={styles.noGamesText}>You have no Games Today</Text>
        <Pressable style={styles.calendarButton}>
          <Text style={styles.calendarText}>View My Calendar</Text>
        </Pressable>
      </View>

      <View style={styles.actionContainer}>
        <Pressable style={styles.actionBox}>
          <Image
            style={styles.actionImage}
            source={{
              uri: 'https://images.pexels.com/photos/262524/pexels-photo-262524.jpeg?auto=compress&cs=tinysrgb&w=800',
            }}
          />
          <Pressable style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Play</Text>
            <Text style={styles.actionSubText}>
              Find and play at the best arenas near you
            </Text>
          </Pressable>
        </Pressable>

        <Pressable style={styles.actionBox}>
          <Image
            style={styles.actionImage}
            source={{
              uri: 'https://images.pexels.com/photos/262524/pexels-photo-262524.jpeg?auto=compress&cs=tinysrgb&w=800',
            }}
          />
          <Pressable style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Play</Text>
            <Text style={styles.actionSubText}>
              Find and play at the best arenas near you
            </Text>
          </Pressable>
        </Pressable>

        <Pressable style={styles.actionBox}>
          <Image
            style={styles.actionImage}
            source={{
              uri: 'https://images.pexels.com/photos/262524/pexels-photo-262524.jpeg?auto=compress&cs=tinysrgb&w=800',
            }}
          />
          <Pressable style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Play</Text>
            <Text style={styles.actionSubText}>
              Find and play at the best arenas near you
            </Text>
          </Pressable>
        </Pressable>
      </View>

     


<View style={styles.spotlightContainer}>
        <Text style={styles.spotlightTitle}>Spotlight</Text>
        {loading ? (
          <ActivityIndicator size="large" color="green" />
        ) : venues.length === 0 ? (
          <Text>No venues available</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {venues.map((venue) => (
              <Pressable
                key={`${venue._id}-${venue.venueName}`}
                onPress={() =>
                  navigation.navigate('BookNow', { venueId: venue._id })
                }
              >
                <ImageBackground
                  imageStyle={styles.spotlightImage}
                  style={styles.spotlightItem}
                  source={{ uri: `http://10.0.2.2:3000/${venue.venueImage}` }}
                  onError={(error) =>
                    console.error('Image loading error:', error.nativeEvent)
                  }
                ><View style={styles.spotlightOverlay}>
                <Text style={styles.spotlightArenaName}>{venue.venueName}</Text>
                <Text style={styles.spotlightLocation}>
                  {venue.location?.locationName || 'Unknown Location'}
                </Text>
                <Text style={styles.spotlightPrice}>
                  {venue.discountedPrice ? (
                    <>
                      <Text style={styles.discountedPrice}>Rs {venue.discountedPrice}/hour</Text>
                      <Text style={styles.originalPrice}>Rs {venue.pricePerHour}/hour</Text>
                    </>
                  ) : (
                    <Text>Rs {venue.pricePerHour}/hour</Text>
                  )}
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
  headerLeftText: {
    marginLeft: 15,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 15,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },

  findGroundContainer: {
    padding: 13,
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
    borderRadius: 25,
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
  actionContainer: {
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,

    flexDirection: 'row',
  },
  actionBox: {
    // flex: 1,
    borderWidth: 1,
  },
  actionImage: {
    width: 180,
    height: 120,
    borderRadius: 10,
  },
  actionTextContainer: {
    backgroundColor: 'white',
    padding: 12,
    width: 180,
    borderRadius: 10,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  actionSubText: {
    fontSize: 15,
    color: 'gray',
    marginTop: 7,
  },
  spotlightContainer: {
    padding: 13,
  },
  spotlightTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  spotlightImage: {},
  spotlightItem: {
    width: 220,
    height: 280,
    marginRight: 10,
    marginVertical: 15,
  },
  spotlightOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
    borderRadius: 5,
  },
  spotlightArenaName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  spotlightLocation: {
    color: 'white',
    fontSize: 14,
  },
  spotlightPrice: {
    color: 'lightgreen',
    fontSize: 14,
    fontWeight: 'bold',
  },
  originalPrice: {
    color: 'lightgray',
    fontSize: 14,
    textDecorationLine: 'line-through', 
  },
  discountedPrice: {
    color: 'lightgreen',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

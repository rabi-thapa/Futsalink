import React, {useContext, useEffect, useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {VenueContext} from '../context/VenueContext';
import {useNavigation} from '@react-navigation/native';
import CustomDropdown from '../components/CustomDropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';

const SearchScreen = () => {
  const {fetchVenues, venues, loading} = useContext(VenueContext);

  const navigation = useNavigation();

  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('location');
  const [sortOrder, setSortOrder] = useState('asc');
  const [locations, setLocations] = useState(['All Locations']);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    
    const uniqueLocations = [
      'All Locations',
      ...new Set(
        venues
          .filter(venue => venue?.location?.locationName) 
          .map(venue => venue.location.locationName.trim()),
      ),
    ];
    setLocations(uniqueLocations);
  }, [venues]);

 
  useEffect(() => {
    fetchVenues({
      location: selectedLocation !== 'All Locations' ? selectedLocation : '',
      search: searchText,
      sortBy,
      sortOrder,
      page, 
    });
  }, [selectedLocation, searchText, sortBy, sortOrder]);

  const handleLocationChange = itemValue => {
    setSelectedLocation(itemValue);
    setSearchText('');
  };


  const viewOnMap = venue => {
    if (!venue.location?.latitude || !venue.location?.longitude) {
      alert('Location data is missing for this venue.');
      return;
    }
    navigation.navigate('MapScreen', {venues: [venue]}); 
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <View style={styles.headerContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search For Arenas"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
          />
          <Ionicons name="search" size={22} color="gray" />
        </View>

        <View style={styles.dropdownRow}>
          <CustomDropdown
            label="Location"
            iconName="location"
            options={locations.map(loc => ({label: loc, value: loc}))}
            selectedValue={selectedLocation}
            onValueChange={handleLocationChange}
          />
          <CustomDropdown
            label="Sort By"
            iconName="filter"
            options={[
              {label: 'Location', value: 'location'},
              {label: 'Name', value: 'venueName'},
              {label: 'Price', value: 'price'},
            ]}
            selectedValue={sortBy}
            onValueChange={value => setSortBy(value)}
          />
          <CustomDropdown
            label="Order"
            iconName="swap-vertical"
            options={[
              {label: 'Asc', value: 'asc'},
              {label: 'Desc', value: 'desc'},
            ]}
            selectedValue={sortOrder}
            onValueChange={value => setSortOrder(value)}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.mapIconContainer}
        onPress={() => {
          
          const validVenues = venues.filter(
            venue =>
              venue && venue.location?.latitude && venue.location?.longitude,
          );

          
          navigation.navigate('MapScreen', {venues: validVenues});
        }}>
        <Ionicons name="map" size={28} color="#4CAF50" />
        <Text style={styles.mapIconText}>Map</Text>
      </TouchableOpacity>

      <ScrollView style={styles.allVenues}>
        {loading ? (
          <ActivityIndicator size="large" color="green" />
        ) : venues.length === 0 ? (
          <Text style={styles.noVenuesText}>No venues available</Text>
        ) : (
          venues
            .filter(venue => venue) // Filter out null or undefined venues
            .map(venue => (
              <TouchableOpacity
               key={venue._id} 
               onPress={() => navigation.navigate('BookNow', { venueId: venue._id })}
               style={styles.venueCard}>
                <Image
                  source={{
                    uri: venue?.venueImage
                      ? `http://10.0.2.2:3000/${venue.venueImage}`
                      : 'https://via.placeholder.com/300', // Fallback image
                  }}
                  style={styles.venueImage}
                />
                <View style={styles.venueDetails}>
                  <Text style={styles.venueName}>
                    {venue?.venueName || 'Unknown Venue'}
                  </Text>
                  <Text style={styles.venueLocation}>
                    {venue?.location?.locationName || 'Unknown Location'}
                  </Text>
                  <Text style={styles.venuePrice}>
                    Rs {venue?.pricePerHour || 'N/A'} / hr
                  </Text>

                 
                  <TouchableOpacity
                    onPress={() => viewOnMap(venue)}
                    style={styles.mapIconWrapper}>
                    <AntDesign name="enviromento" size={22} color="#4CAF50" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  headerContainer: {
    padding: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ededed',
    padding: 8,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginRight: 8,
  },
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 10,
  },
  mapIconContainer: {
    marginHorizontal: 10,
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapIconText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  allVenues: {
    marginTop: 10,
  },
  noVenuesText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  venueCard: {
    margin: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
  },
  venueImage: {
    width: '100%',
    height: 200,
  },
  venueDetails: {
    padding: 10,
  },
  venueName: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  venueLocation: {
    color: '#777',
    marginVertical: 5,
  },
  venuePrice: {
    color: 'green',
    fontWeight: 'bold',
  },

  mapIconWrapper: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: '#e0f2f1',
    padding: 8,
    borderRadius: 8,
  },
  

  viewOnMapButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  viewOnMapButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

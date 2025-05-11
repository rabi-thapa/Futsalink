import React, {useRef, useEffect} from 'react';
import {View, StyleSheet, Text, TouchableOpacity, Linking} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {useRoute} from '@react-navigation/native';

const MapScreen = () => {
  const route = useRoute();
  const mapView = useRef(null);
  const venues = route.params?.venues || [];

  
  const openGoogleMaps = (venue) => {
    if (!venue.location?.latitude || !venue.location?.longitude) {
      alert('Location data is missing for this venue.');
      return;
    }

    const url = `https://www.google.com/maps?q=${venue.location.latitude},${venue.location.longitude}`;
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open Google Maps:', err)
    );
  };

  useEffect(() => {
    if (venues.length > 0 && mapView.current) {
      const first = venues[0];
      mapView.current.animateToRegion({
        latitude: first.location.latitude,
        longitude: first.location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
  }, [venues]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapView}
        style={styles.map}
        initialRegion={{
          latitude: venues.length > 0 ? venues[0].location.latitude : 27.7172,
          longitude: venues.length > 0 ? venues[0].location.longitude : 85.324,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}>
        {venues.map((venue) => (
          <Marker
            key={venue._id}
            title={venue.venueName}
            description={`Rs ${venue.pricePerHour} / hr`}
            coordinate={{
              latitude: venue.location.latitude,
              longitude: venue.location.longitude,
            }}
            onPress={() => openGoogleMaps(venue)} // Redirect to Google Maps on marker press
          >
           
            <View style={styles.marker}>
              <Text style={styles.markerText}>{venue.venueName.charAt(0)}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      
      {venues.length > 0 && (
        <TouchableOpacity
          style={styles.googleMapsButton}
          onPress={() => openGoogleMaps(venues[0])}>
          <Text style={styles.buttonText}>View on Google Maps</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  marker: {
    backgroundColor: '#FF5733',
    padding: 5,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  googleMapsButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

const VendorHome = () => {
  const VENUE_ENDPOINT = Config.VENUE_ENDPOINT;
  const navigation = useNavigation();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // console.log('Venue endpoint:', VENUE_ENDPOINT);

  const fetchVenues = async () => {
    try {

      // console.log("working nicely")
      setLoading(true);
      // console.log('Venue endpoint:', VENUE_ENDPOINT);
      const accessToken = await AsyncStorage.getItem('accessToken');

      if (!accessToken) {
        Alert.alert('Error', 'You need to be logged in');
        return;
      }

      // console.log("woo", `${VENUE_ENDPOINT}/myVenues`)


      const response = await fetch(`${VENUE_ENDPOINT}/myVenues`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch venues');
      }

      setVenues(data.venues);
    } catch (error) {
      console.error('Error fetching venues:', error);
      Alert.alert('Error', 'Could not load venues');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVenue = async (venueId) => {
    Alert.alert(
      "Delete Venue",
      "Are you sure you want to delete this venue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const accessToken = await AsyncStorage.getItem("accessToken");
  
              if (!accessToken) {
                Alert.alert("Error", "You need to be logged in");
                return;
              }
  
              const response = await fetch(`${VENUE_ENDPOINT}/deleteVenue/${venueId}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              });
  
              const data = await response.json();
  
              if (!response.ok) {
                throw new Error(data.message || "Failed to delete venue");
              }
  
              Alert.alert("Success", "Venue deleted successfully!");
  
              // Update state to remove the deleted venue
              setVenues((prevVenues) => prevVenues.filter((venue) => venue._id !== venueId));
  
            } catch (error) {
              console.error("Error deleting venue:", error);
              Alert.alert("Error", "Could not delete the venue.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  

  // Refetch venues whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchVenues();
    }, []),
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddVenueScreen')}>
        <Text style={styles.addButtonText}>+ Add Venue</Text>
      </TouchableOpacity>

      <View style={styles.tableHeader}>
        <Text style={styles.headerText}>Venue</Text>
        <Text style={styles.headerText}>Location</Text>
        <Text style={styles.headerText}>Price</Text>
        <Text style={styles.headerText}>Type</Text>
        <Text style={styles.headerText}>Status</Text>
        <Text style={styles.headerText}>Actions</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <FlatList
          data={venues}
          keyExtractor={item => item._id}
          renderItem={({item}) => (
            <View style={styles.tableRow}>
              <Text style={styles.cell}>{item.venueName}</Text>
              <Text style={styles.cell}>{item.location?.locationName}</Text>
              <Text style={styles.cell}>NPR{item.pricePerHour}</Text>
              <Text style={styles.cell}>{item.type}</Text>
              // Inside the FlatList renderItem function
<Text
  style={[
    styles.cell,
    item.status === 1 ? styles.active : item.status === 0 ? styles.inactive : styles.maintenance,
  ]}>
  {item.status === 1 ? 'Active' : item.status === 0 ? 'Inactive' : 'Under Maintenance'}
</Text>
          
              <View style={styles.actionIcons}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() =>
                    navigation.navigate('UpdateVenueScreen', {
                      venueId: item._id,
                    })
                  }>
                  <Feather name="edit" size={24} color="#2962FF" />
                </TouchableOpacity>
          
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => handleDeleteVenue(item._id)}>
                  <AntDesign name="delete" size={18} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          
        />
      )}
    </View>
  );
};

export default VendorHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f1fdf3',
  },
  addButton: {
    backgroundColor: '#29B6F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
    backgroundColor: '#81C784',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
    color: '#212121',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  actionIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
  },
  iconButton: {
    marginHorizontal: 5,
  },
  active: {
    color: 'green',
    fontWeight: 'bold',
  },
  inactive: {
    color: 'gray',
    fontWeight: 'bold',
  },
  maintenance: {
    color: 'orange',
    fontWeight: 'bold',
  },
});

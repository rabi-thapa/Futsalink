import {Pressable, StyleSheet, Text, View, Image} from 'react-native';
import React from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useNavigation} from '@react-navigation/native';


const VenueCard = ({item}) => {

  const navigation = useNavigation();
  if (!item) return null;

  return (
    <View style={styles.cardContainer}>
      <Pressable style={styles.pressable}
         onPress={() =>
          navigation.navigate('Review', {
            venueId: item.bookings.venue._id,
            venueName: item.name,
          })
        }
      
      >
        {/* Venue Image */}
        <Image
          source={{
            uri: item.image?.startsWith('http')
              ? item.image
              : `http://10.0.2.2:3000/${item.image}`,
          }}
          style={styles.image}
        />

        {/* Content */}
        <View style={styles.cardContent}>
          {/* Title and Rating */}
          <View style={styles.header}>
            <Text style={styles.name}>
              {item.name?.length > 40
                ? item.name.substring(0, 40) + '...'
                : item.name}
            </Text>

            <View style={styles.ratingBox}>
              <AntDesign name="star" size={14} color="white" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>

          {/* Address */}
          <Text style={styles.address}>
            {item.address?.length > 50
              ? item.address.substring(0, 50) + '...'
              : item.address}
          </Text>

          {/* Booking Time */}
          <Text style={styles.timing}>Booked: {item.timings}</Text>

          {/* Optional Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerLeft}>Status: Confirmed</Text>
            <Text style={styles.footerRight}>
              NPR {item.bookings?.price || 1250}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
};

export default VenueCard;

const styles = StyleSheet.create({
  cardContainer: {
    margin: 15,
  },
  pressable: {
    backgroundColor: 'white',
    borderRadius: 5,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  cardContent: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'green',
    padding: 6,
    borderRadius: 5,
  },
  ratingText: {
    color: 'white',
    fontWeight: 'bold',
  },
  address: {
    color: 'gray',
  },
  divider: {
    height: 1,
    borderWidth: 0.6,
    borderColor: '#E0E0E0',
    marginVertical: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

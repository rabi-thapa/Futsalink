import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

const Facilities = () => {
    const services = [
        {
          id: '0',
          name: 'Floodlights',
        },
        {
          id: '1',
          name: 'Astro Turf Ground',
        },
        {
          id: '2',
          name: 'Washrooms & Changing Rooms',
        },
        {
          id: '3',
          name: 'First Aid Kit',
        },
        {
          id: '4',
          name: 'Drinking Water Facility',
        },
        {
          id: '5',
          name: 'Cafeteria & Juice Bar',
        },
        {
          id: '6',
          name: 'Parking Area',
        },
        {
          id: '7',
          name: 'Seating & Spectator Area',
        },
        {
          id: '8',
          name: 'Locker Facility',
        },
        {
          id: '9',
          name: 'Live Match Scoreboard',
        },
        {
          id: '10',
          name: 'Music & Sound System',
        }
      ];
      
  return (
    <View>
      <Text style={{fontSize: 18, fontWeight: '600'}}>Our Facilities</Text>

      <View
        style={{flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap'}}>
        {services?.map((item, index) => (
          <View
            style={{
              margin: 10,
              backgroundColor: '#17B169',
              paddingHorizontal: 11,
              paddingVertical: 5,
              borderRadius: 25,
            }}
            key={index}>
            <Text style={{textAlign: 'center', color: 'white'}}>
              {item?.name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Facilities;

const styles = StyleSheet.create({});

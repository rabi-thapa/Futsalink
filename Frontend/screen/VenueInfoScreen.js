import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Image,
  Pressable,
} from 'react-native';
import React from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Facilities from '../components/Facilities';
const VenueInfoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  console.log( "route", route?.params);
  return (
    <>
      <SafeAreaView>
        <ScrollView>
          <View>
            <View>
              <Image
                style={{width: '100%', height: 200, resizeMode: 'cover'}}
                source={{
                  uri: 'https://images.pexels.com/photos/262524/pexels-photo-262524.jpeg?auto=compress&cs=tinysrgb&w=800',
                }}
              />
            </View>

            <View style={{padding: 10}}>
              <Text>{route?.params?.name}</Text>
              <View
                style={{
                  marginTop: 5,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                }}>
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="black"
                />
                <Text style={{fontSize: 15, fontWeight: '500'}}>
                  {' '}
                  6:00 AM - 9:00 PM
                </Text>
              </View>

              <View style={{flexDirection: 'row', gap: 5, marginVertical: 6}}>
                <Ionicons name="location-outline" size={24} color="black" />
                <Text style={{fontSize: 14, width: '80%', fontWeight: '500'}}>
                  {route?.params?.location}
                </Text>
              </View>
            </View>

            <View
              style={{
                padding: 10,
                flexDirection: 'row',
              }}>
              <View>
                <View style={{flexDirection: 'row'}}>
                  {[0, 0, 0, 0, 0].map((en, i) => (
                    <FontAwesome
                      key={i}
                      style={{paddingHorizontal: 3}}
                      // name={
                      //   i < Math.floor(route.params.rating) ? 'star' : 'star-o'
                      // }
                      size={15}
                      color="#FFD700"
                    />
                  ))}
                  {/* <Text> {route.params.rating} (9 ratings)</Text> */}
                </View>
                <Pressable
                  style={{
                    marginTop: 6,
                    width: 160,
                    borderColor: '#36454F',
                    borderWidth: 2,
                    borderRadius: 5,
                    justifyContent: 'center',
                    padding: 10,
                  }}>
                  <Text>Rate Venue</Text>
                </Pressable>
              </View>
            </View>

            <Facilities />

            {/* <View style={{marginHorizontal: 10}}>
              <Text style={{fontSize: 15, fontWeight: 'bold'}}>Activities</Text>
              <Pressable
                style={{
                  borderColor: '#787878',
                  marginTop: 10,
                  borderWidth: 1,
                  padding: 10,
                  justifyContent: 'center',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  borderRadius: 5,
                }}>
                <AntDesign name="plus" size={24} color="black" />

                <Text>Create Activity </Text>
              </Pressable>
            </View> */}

            <Pressable
              style={{
                backgroundColor: 'green',
                padding: 8,
                marginBottom: 30,
                borderRadius: 3,
                marginHorizontal: 15,
                marginTop: 3,
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: 'white',
                }}>
                Book Now
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default VenueInfoScreen;

const styles = StyleSheet.create({});

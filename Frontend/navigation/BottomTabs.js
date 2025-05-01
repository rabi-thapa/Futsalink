import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screen/HomeScreen';
import SearchScreen from '../screen/SearchScreen';
import BookScreen from '../screen/BookScreen';
import ProfileScreen from '../screen/ProfileScreen';

import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="HOME"
        component={HomeScreen}
        options={{
          tabBarActiveTintColor: 'green',
          tabBarIcon: ({focused}) => (
            <Ionicons
              name="home-outline"
              size={24}
              color={focused ? 'green' : '#989898'}
            />
          ),
        }}
      />

      <Tab.Screen
        name="SEARCH"
        component={SearchScreen}
        options={{
          tabBarActiveTintColor: 'green',
          headerShown: false,
          tabBarIcon: ({focused}) =>
            focused ? (
              <AntDesign name="search1" size={24} color="green" />
            ) : (
              <AntDesign name="search1" size={24} color="#989898" />
            ),
        }}
      />

      <Tab.Screen
        name="BOOK"
        component={BookScreen}
        options={{
          tabBarActiveTintColor: 'green',
          tabBarIcon: ({focused}) => (
            <SimpleLineIcons
              name="book-open"
              size={24}
              color={focused ? 'green' : '#989898'}
            />
          ),
        }}
      />

      <Tab.Screen
        name="PROFILE"
        component={ProfileScreen}
        options={{
          tabBarActiveTintColor: 'green',
          tabBarIcon: ({focused}) => (
            <Ionicons
              name="person-outline"
              size={24}
              color={focused ? 'green' : '#989898'}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default BottomTabs;

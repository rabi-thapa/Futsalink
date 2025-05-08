import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import VendorHome from '../screen/vendor/VendorHome';
import OrdersScreen from '../screen/vendor/OrdersScreen';
import DashBoardScreen from '../screen/vendor/DashBoardScreen';
import ProfileScreen from '../screen/ProfileScreen';
import AddVenueScreen from '../screen/vendor/AddVenueScreen';
import BottomTabs from './BottomTabs';
import SignInScreen from '../screen/SignInScreen';
import SignUpScreen from '../screen/SignUpScreen';
import ChangePassword from '../screen/ChangePassword';
import UpdateProfileScreen from '../screen/UpdateProfileScreen';
import UserProfileDetails from '../screen/UserProfileDetails';

import Ionicons from 'react-native-vector-icons/Ionicons';

import UpdateVenueScreen from '../screen/vendor/UpdateVenueScreen';

import VenueDetailScreen from '../screen/vendor/charts/VenueDetailScreen';

import DiscountManagementScreen from '../screen/vendor/DiscountManagementScreen';

import VenuePeakHourDetailScreen from '../screen/vendor/charts/VenuePeakHourDetailScreen';



const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function VendorTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="VendorHome"
        component={VendorHome}
        options={{
          headerShown: false,
          tabBarActiveTintColor: 'blue',
          tabBarIcon: ({focused}) => (
            <Ionicons
              name="business-outline"
              size={24}
              color={focused ? 'blue' : '#989898'}
            />
          ),
        }}
      />

      <Tab.Screen
        name="DASHBOARD"
        component={DashBoardScreen}
        options={{
          tabBarActiveTintColor: 'blue',
          tabBarIcon: ({focused}) => (
            <Ionicons
              name="analytics-outline"
              size={24}
              color={focused ? 'blue' : '#989898'}
            />
          ),
        }}
      />

      <Tab.Screen
        name="ORDERS"
        component={OrdersScreen}
        options={{
          unmountOnBlur: true,
          tabBarActiveTintColor: 'blue',
          tabBarIcon: ({focused}) => (
            <Ionicons
              name="list-outline"
              size={24}
              color={focused ? 'blue' : '#989898'}
            />
          ),
        }}
      />

      <Tab.Screen
        name="PROFILE"
        component={ProfileScreen}
        options={{
          tabBarActiveTintColor: 'blue',
          tabBarIcon: ({focused}) => (
            <Ionicons
              name="person-circle-outline"
              size={24}
              color={focused ? 'blue' : '#989898'}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function VendorStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="VendorMain"
        component={VendorTabs}
        options={{
          headerShown: false,
        }}
      />


      <Stack.Screen
        name="Main"
        component={BottomTabs}
        options={{headerShown: false}}
        />

      <Stack.Screen
        name="DiscountManagementScreen"
        component={DiscountManagementScreen}
        options={{headerShown: false}}
        />

      <Stack.Screen
        name="AddVenueScreen"
        component={AddVenueScreen}
        options={{title: 'Add Venue'}}
      />
        

      <Stack.Screen
        name="UpdateVenueScreen"
        component={UpdateVenueScreen}
        options={{title: 'Update Venue'}}
      />

 

      <Stack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{title: 'Sign In'}}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{title: 'Sign Up'}}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePassword}
        options={{title: 'Change Password'}}
      />
      <Stack.Screen
        name="UpdateProfile"
        component={UpdateProfileScreen}
        options={{title: 'Update Profile'}}
      />
      <Stack.Screen
        name="UserProfileDetails"
        component={UserProfileDetails}
        options={{title: 'Profile Details'}}
      />

      
<Stack.Screen name="VenueDetail" component={VenueDetailScreen} options={{ title: "Venue Details" }} />



<Stack.Screen
  name="VenuePeakHourDetail"
  component={VenuePeakHourDetailScreen}
  options={{ title: "Bookings by Hour" }}
/>
    </Stack.Navigator>
  );
}

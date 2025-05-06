import {View, ActivityIndicator} from 'react-native';
import React, {useContext} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';

import SignInScreen from '../screen/SignInScreen';
import OtpVerificationScreen from '../screen/OtpVerificationScreen';
import SignUpScreen from '../screen/SignUpScreen';
import ChangePassword from '../screen/ChangePassword';
import UpdateProfileScreen from '../screen/UpdateProfileScreen';
import UserProfileDetails from '../screen/UserProfileDetails';
import BookNowScreen from '../screen/BookNowScreen';
import PaymentScreen from '../screen/PaymentScreen';
import ReviewScreen from '../screen/ReviewScreen';
import MapScreen from '../screen/MapScreen';

import BookingSuccessScreen from '../screen/BookingSuccessScreen';

import {VendorStack} from './VendorStack';
import BottomTabs from './BottomTabs';
import HomeScreen from '../screen/HomeScreen';

import {AuthContext, AuthProvider} from '../context/AuthContext';
import {VenueProvider} from '../context/VenueContext';
import UserVerificationScreen from '../screen/UserVerificationScreen';

import VenueDetailsScreen from '../screen/vendor/charts/VenueDetailScreen';

const Stack = createNativeStackNavigator();

function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{
          title: 'Sign In',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Main"
        component={BottomTabs}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="OtpVerification"
        component={OtpVerificationScreen}
        options={{
          title: 'Verify OTP',
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="UserVerification"
        component={UserVerificationScreen}
        options={{
          title: 'Sign In',
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="VenueDetail"
        component={VenueDetailsScreen}
        options={{title: 'Venue Details'}}
      />

      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{headerShown: false}}
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

      <Stack.Screen name="BookNow" component={BookNowScreen} />

      <Stack.Screen
        name="BookingSuccessScreen"
        component={BookingSuccessScreen}
        options={{
          title: 'Success Checkout ',
          headerShown: false,
        }}
      />

      <Stack.Screen name="Review" component={ReviewScreen} />
      <Stack.Screen name="MapScreen" component={MapScreen} />

      <Stack.Screen
        name="PaymentScreen"
        component={PaymentScreen}
        options={{title: 'Payment'}}
      />

      <Stack.Screen
        name="VendorStack"
        component={VendorStack}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}

const NavigationWrapper = () => {
  const {userRole, loading} = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userRole === 'vendor' ? <VendorStack /> : <MainStack />}
    </NavigationContainer>
  );
};

const AppNavigation = () => {
  return (
    <AuthProvider>
      <VenueProvider>
        <NavigationWrapper />
      </VenueProvider>
    </AuthProvider>
  );
};

export default AppNavigation;

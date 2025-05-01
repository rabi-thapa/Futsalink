import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KhaltiCheckoutScreen = ({ route, navigation }) => {
  const { amount, productIdentity, productName, bookingId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState(null);

  useEffect(() => {
    if (!amount || !productIdentity || !productName || !bookingId) {
      console.error('Missing required parameters:', { amount, productIdentity, productName, bookingId });
      Alert.alert('Error', 'Missing required payment details. Please try again.');
      navigation.goBack();
      return;
    }

    const initiatePayment = async () => {
      try {
        // Retrieve the user's access token
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          throw new Error('User not authenticated');
        }

        // Send a request to the backend to initiate the Khalti payment
        const response = await axios.post(
          'http://10.0.2.2:3000/api/payment/khalti',
          {
            amount: amount,
            bookingId: bookingId,
            productName: productName,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const { pidx, paymentUrl } = response.data; // Response from the backend
        console.log('Payment Initiation Response:', response.data);

        // Set the payment URL received from the backend
        setPaymentUrl(paymentUrl);
      } catch (error) {
        console.error('Error initiating payment:', error);
        Alert.alert('Error', 'Failed to initiate payment. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initiatePayment();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#17B169" />
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: paymentUrl }}
      onNavigationStateChange={(event) => {
        // Handle redirection after payment completion
        if (event.url.includes('http://10.0.2.2:3000/api/payment/khalti/callback')) {
          navigation.navigate('BookingSuccessScreen');
        }
      }}
    />
  );
};

export default KhaltiCheckoutScreen;
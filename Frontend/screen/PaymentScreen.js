import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';



const PaymentScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { venue, date, startTime, endTime, bookingId } = route.params || {};
  const [showKhaltiModal, setShowKhaltiModal] = useState(false); // State for Khalti modal
  const [showPayPalModal, setShowPayPalModal] = useState(false); // State for PayPal modal
  const [status, setStatus] = useState('Pending');
  const [payPalUrl, setPayPalUrl] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!venue || !bookingId) {
      console.error('Venue or Booking ID is missing in route params');
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [venue, bookingId]);

  const startPayPalPayment = async () => {
    setLoading(true);
    try {
      if (!bookingId) {
        throw new Error('Booking ID not available');
      }
      const paymentRes = await fetch('http://10.0.2.2:3000/api/payment/paypal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ bookingId }),
      });
      const paymentData = await paymentRes.json();
      if (paymentData.approvalUrl) {
        setPayPalUrl(paymentData.approvalUrl);
        setShowPayPalModal(true); // Show PayPal modal
      } else {
        alert('Failed to get PayPal URL');
      }
    } catch (error) {
      console.error('Error during PayPal payment initiation:', error);
    } finally {
      setLoading(false);
    }
  };

  const startKhaltiPayment = async () => {
    setLoading(true);
    try {
      console.log('Starting Khalti payment process...');
      if (!bookingId) {
        console.error('Error: Booking ID is missing');
        throw new Error('Booking ID not available');
      }
      console.log('Booking ID:', bookingId);
      if (!venue || !venue.pricePerHour || !venue.venueName) {
        console.error('Error: Venue details are missing or incomplete');
        throw new Error('Venue details are missing or incomplete');
      }
      console.log('Venue Details:', { pricePerHour: venue.pricePerHour, venueName: venue.venueName });
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.error('Error: User not authenticated');
        throw new Error('User not authenticated');
      }
      console.log('Access Token:', token);
      const payload = {
        amount: venue.pricePerHour * 100, 
        bookingId: bookingId,
        productName: venue.venueName,
      };
      console.log('Payload to Backend:', payload);
      console.log('Sending POST request to backend...');
      const response = await fetch('http://10.0.2.2:3000/api/payment/khalti', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      console.log('Raw Response from Backend:', response);
      if (!response.ok) {
        console.error('Error: Backend returned a non-OK response');
        const errorData = await response.json();
        console.error('Backend Error Data:', errorData);
        throw new Error(errorData.message || 'Failed to initiate payment');
      }
      const data = await response.json();
      console.log('Parsed Response from Backend:', data);
      const { paymentUrl } = data;
      console.log('Extracted Payment Details:', { paymentUrl });
      if (!paymentUrl) {
        console.error('Error: Payment URL is missing in the backend response');
        throw new Error('Failed to get payment URL from backend');
      }
      setPaymentUrl(paymentUrl);
      setShowKhaltiModal(true);
      console.log('Payment URL set successfully:', paymentUrl);
    } catch (error) {
      console.error('Error during Khalti payment initiation:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
      console.log('Loading state reset.');
    }
  };

  const handleKhaltiResponse = (event) => {
    if (event.url.includes('http://10.0.2.2:3000/api/payment/khalti/callback')) {
      setShowKhaltiModal(false);
      navigation.navigate('BookingSuccessScreen');
    }
  };

  const handlePaypalResponse = (data) => {
    if (data.url.includes('success')) {
      setShowPayPalModal(false);
      setStatus('Complete');
      navigation.navigate('BookingSuccessScreen');
    } else if (data.url.includes('cancel')) {
      setShowPayPalModal(false);
      setStatus('Cancelled');
    }
  };

  if (loading || !venue) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#17B169" />
        {!venue && <Text style={styles.errorMessage}>Venue data is missing</Text>}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.pressable}>
          <Image source={{ uri: `http://10.0.2.2:3000/${venue.venueImage}` }} style={styles.image} />
          <View style={styles.header}>
            <View style={styles.title}>
              <View>
                <Text style={styles.name}>{venue.venueName}</Text>
                <Text style={styles.address}>
                  {venue.location?.locationName || 'Unknown Location'}
                </Text>
              </View>
              <View style={styles.ratingContainer}>
                <MaterialCommunityIcons name="star" size={24} color="green" />
                <Text>4.5</Text>
              </View>
            </View>
            <View>
              <Text style={styles.description}>
                {venue.description || 'No description available'}
              </Text>
            </View>
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.detailDateAndTime}>Date:</Text>
            <Text style={styles.dateText}>{date}</Text>
            <View style={styles.pickerContainer}>
              <View>
                <Text style={styles.pickerLabel}>Start Time:</Text>
                <Text style={styles.pickerValue}>{startTime}</Text>
              </View>
              <View>
                <Text style={styles.pickerLabel}>End Time:</Text>
                <Text style={styles.pickerValue}>{endTime}</Text>
              </View>
            </View>
            <Text style={styles.pricePerHour}>Price:</Text>
            <Text style={styles.pricePerHourText}>NPR{venue?.pricePerHour}</Text>
          </View>
          <View style={styles.paymentButtonsContainer}>
            <TouchableOpacity
              style={[styles.bookButtonPayPal, { marginRight: 5 }]}
              onPress={startPayPalPayment}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.bookButtonText}>PayPal</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bookButtonKhalti, { marginLeft: 5 }]}
              onPress={startKhaltiPayment}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.bookButtonText}>Khalti</Text>
              )}
            </TouchableOpacity>
          </View>
          <Text
            style={[
              styles.paymentStatus,
              {
                color:
                  status === 'Complete'
                    ? '#16a34a'
                    : status === 'Cancelled'
                    ? '#dc2626'
                    : '#f59e0b',
              },
            ]}>
            Payment Status: {status}
          </Text>
        </View>
      </KeyboardAvoidingView>

      
      <Modal visible={showKhaltiModal} onRequestClose={() => setShowKhaltiModal(false)}>
        {paymentUrl ? (
          <WebView
            source={{ uri: paymentUrl }}
            onNavigationStateChange={handleKhaltiResponse}
          />
        ) : (
          <ActivityIndicator size="large" color="#17B169" style={{ marginTop: 20 }} />
        )}
      </Modal>

     
      <Modal visible={showPayPalModal} onRequestClose={() => setShowPayPalModal(false)}>
        {payPalUrl ? (
          <WebView
            source={{ uri: payPalUrl }}
            onNavigationStateChange={handlePaypalResponse}
          />
        ) : (
          <ActivityIndicator size="large" color="#17B169" style={{ marginTop: 20 }} />
        )}
      </Modal>
    </SafeAreaView>
  );
};

export default PaymentScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorMessage: {
    marginTop: 10,
    color: 'red',
  },
  pressable: {
    padding: 20,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  header: {
    marginTop: 20,
  },
  title: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  address: {
    fontSize: 14,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  description: {
    marginTop: 10,
    fontSize: 14,
    color: '#333',
  },
  detailsContainer: {
    marginTop: 20,
  },
  detailDateAndTime: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  pickerValue: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  pricePerHour: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  pricePerHourText: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  paymentButtonsContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  bookButtonPayPal: {
    flex: 1,
    backgroundColor: '#0070ba',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  bookButtonKhalti: {
    flex: 1,
    backgroundColor: '#17B169',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  paymentStatus: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
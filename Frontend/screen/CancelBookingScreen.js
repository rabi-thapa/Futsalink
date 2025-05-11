import { StyleSheet, Text, View } from 'react-native';
import React, {useState}from 'react';

import Background from '../components/Background';
import Logo2 from '../components/Logo2';
import Header from '../components/Header';
import Paragraph from '../components/Paragraph';
import Button from '../components/Button';

import AsyncStorage from '@react-native-async-storage/async-storage';


const CancelBookingScreen = ({ route, navigation }) => {
  const { bookingId, venueName } = route.params || {};

  
    const [loading, setLoading] = useState(false);

    const handleCancelBooking = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const response = await fetch('http://10.0.2.2:3000/api/bookings/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ bookingId }), 
            });

            const result = await response.json();
            if (response.ok) {
                alert("Booking canceled successfully");
                navigation.navigate('History'); 
            } else {
                alert(result.message || "Failed to cancel booking");
            }
        } catch (error) {
            console.error("Error canceling booking:", error);
            alert("An error occurred while canceling the booking.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Background>
            <Logo2 />
            <Header>Cancel Booking</Header>
            <Button mode="contained" onPress={handleCancelBooking} loading={loading}>
                Confirm Cancel Booking
            </Button>
        </Background>
    );
};

export default CancelBookingScreen;

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    color: '#333',
    marginBottom: 24,
    marginHorizontal: 20,
  },
});

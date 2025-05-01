import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const BookingSuccessScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Booking Successful!</Text>
            <Text style={styles.message}>Your payment has been processed successfully.</Text>
            <Button title="Return to Home" onPress={() => navigation.navigate('Main')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
});

export default BookingSuccessScreen;
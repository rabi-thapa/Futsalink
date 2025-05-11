import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const BookingSuccessScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Booking Successful!</Text>
                <Text style={styles.message}>
                    Your payment has been processed successfully.
                </Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Main')}
                >
                    <Text style={styles.buttonText}>Return to Home</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 15,
    },
    message: {
        fontSize: 20,
        textAlign: 'center',
        color: '#4b4b4b',
        marginBottom: 25,
    },
    button: {
        backgroundColor: '#4caf50',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 30,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default BookingSuccessScreen;

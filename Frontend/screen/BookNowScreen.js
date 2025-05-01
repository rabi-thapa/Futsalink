import React, {useState, useEffect, useContext} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {VenueContext} from '../context/VenueContext';
import {useNavigation, useRoute} from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BookNowScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null); // Single dropdown for time slots
  const [loading, setLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [openTimeSlot, setOpenTimeSlot] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]); // Available time slots
  const route = useRoute();
  const navigation = useNavigation();
  const {venueId} = route.params || {};
  const {
    selectedVenue,
    fetchVenueById,
    loading: venueLoading,
  } = useContext(VenueContext);

  useEffect(() => {
    if (venueId) {
      fetchVenueById(venueId);
    }
  }, [venueId]);

  // Generate dynamic time slots based on venue's opening and closing hours
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedVenue?.openingHours || !selectedDate) return;
      const {open, close} = selectedVenue.openingHours;
      if (!open || !close) {
        console.error(
          'Invalid opening or closing hours:',
          selectedVenue.openingHours,
        );
        return;
      }
      // Generate all possible time slots
      const startTime = new Date(`1970-01-01T${open}:00`);
      const endTime = new Date(`1970-01-01T${close}:00`);
      const allSlots = [];
      let currentTime = new Date(startTime);
      while (currentTime < endTime) {
        const startFormatted = currentTime.toTimeString().slice(0, 5); // Format as HH:mm
        currentTime.setHours(currentTime.getHours() + 1);
        const endFormatted = currentTime.toTimeString().slice(0, 5); // Format as HH:mm
        allSlots.push({
          label: `${startFormatted} - ${endFormatted}`,
          value: `${startFormatted}-${endFormatted}`,
        });
      }
      // Fetch booked slots for the selected date and venue
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) throw new Error('User not authenticated');
        const response = await fetch(
          `http://10.0.2.2:3000/api/bookings/booked-slots?venue=${
            selectedVenue._id
          }&date=${selectedDate.toISOString().split('T')[0]}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const bookedSlotsData = await response.json();
        // Filter out booked slots
        const availableSlots = allSlots.filter(slot => {
          const [start, end] = slot.value.split('-');
          return !bookedSlotsData.bookedSlots.some(
            booking => booking.startTime === start && booking.endTime === end,
          );
        });
        setTimeSlots(availableSlots);
      } catch (error) {
        console.error('Error fetching booked slots:', error);
        alert('Failed to fetch available slots. Please try again.');
      }
    };
    fetchAvailableSlots();
  }, [selectedVenue, selectedDate]);

  // Show date picker
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  // Hide date picker
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  // Handle date selection
  const handleConfirm = date => {
    setSelectedDate(date);
    hideDatePicker();
  };

  // Format date for display
  const formatDate = date => {
    return date.toDateString();
  };

  const handleContinueBooking = async () => {
    if (!selectedVenue) {
      console.error('Selected venue is null or undefined');
      alert('Venue data is missing. Please try again.');
      return;
    }
    if (!selectedTimeSlot) {
      alert('Please select a time slot.');
      return;
    }
    const [startTime, endTime] = selectedTimeSlot.split('-');
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('User not authenticated');
      }
      const bookingRes = await fetch('http://10.0.2.2:3000/api/bookings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          venue: selectedVenue._id,
          date: selectedDate.toISOString().split('T')[0],
          startTime,
          endTime,
        }),
      });
      const bookingData = await bookingRes.json();
      console.log('Booking Data:', bookingData);
      if (!bookingData._id) {
        throw new Error(bookingData.message || 'Booking creation failed');
      }
      if (
        bookingData.message ===
        'Booking not available for this time slot. Please choose another time.'
      ) {
        alert(bookingData.message);
        return;
      }
      navigation.navigate('PaymentScreen', {
        venue: selectedVenue,
        date: selectedDate.toISOString().split('T')[0],
        startTime,
        endTime,
        bookingId: bookingData._id,
      });
    } catch (error) {
      console.error(error);
      alert(error.message || 'Booking initiation failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading || venueLoading || !selectedVenue) {
    return <ActivityIndicator size="large" color="green" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}>
          <View style={styles.pressable}>
            {/* Venue Image */}
            <Image
              source={{uri: `http://10.0.2.2:3000/${selectedVenue.venueImage}`}}
              style={styles.image}
            />

            {/* Venue Details */}
            <View style={styles.header}>
              <View style={styles.title}>
                <View>
                  <Text style={styles.name}>{selectedVenue.venueName}</Text>
                  <Text style={styles.address}>
                    {selectedVenue.location?.locationName || 'Unknown Location'}
                  </Text>
                </View>

                {/* Rating */}
                <View style={styles.ratingContainer}>
                  <MaterialCommunityIcons name="star" size={24} color="gold" />
                  <Text style={styles.ratingText}>
                    {selectedVenue.averageRating || 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Description */}
              <View>
                <Text style={styles.description}>
                  {selectedVenue.description || 'No description available'}
                </Text>
              </View>
            </View>

            {/* Price */}
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Price:</Text>
              <Text style={styles.priceValue}>
                NPR {selectedVenue.pricePerHour || 'N/A'} / hour
              </Text>
            </View>

            {/* Date Picker */}
            <View style={styles.detailsContainer}>
              <Text style={styles.detailDateAndTime}>Date:</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={showDatePicker}>
                <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
                minimumDate={new Date()}
              />
            </View>

            {/* Time Slot Picker */}
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Select Time Slot:</Text>
              <DropDownPicker
                style={styles.dropDownPicker}
                open={openTimeSlot}
                value={selectedTimeSlot}
                items={timeSlots}
                setOpen={setOpenTimeSlot}
                setValue={setSelectedTimeSlot}
                setItems={setTimeSlots}
                textStyle={styles.dropDownPickerText}
                dropDownContainerStyle={styles.dropDownContainer}
                searchable={true}
                placeholder="Select a time slot"
                listMode="SCROLLVIEW"
                searchPlaceholder="Search for a time slot"
                listEmptyLabel="No available time slots"
              />
            </View>

            {/* Book Now Button */}
            <Pressable
              style={styles.bookButton}
              onPress={handleContinueBooking}>
              <Text style={styles.bookButtonText}>Book Now</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookNowScreen;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollView: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  pressable: {
    backgroundColor: 'white',
    margin: 10,
    padding: 10,
    borderRadius: 10,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 10,
  },
  header: {
    marginHorizontal: 12,
    marginTop: 10,
    justifyContent: 'space-between',
  },
  title: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: '500',
  },
  address: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 15,
    fontWeight: '400',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 7,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'gold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 10,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
  },
  detailsContainer: {
    marginTop: 16,
    marginHorizontal: 12,
    gap: 5,
    marginBottom: 8,
  },
  detailDateAndTime: {
    fontSize: 16,
    fontWeight: '500',
  },
  dateButton: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'flex-start',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#dcdcdc',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  pickerContainer: {
    marginHorizontal: 12,
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  dropDownPicker: {
    height: 49,
    width: '100%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#dcdcdc',
  },
  dropDownPickerText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  dropDownContainer: {
    width: '100%',
  },
  bookButton: {
    backgroundColor: '#17B169',
    padding: 10,
    borderRadius: 4,
    margin: 12,
  },
  bookButtonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

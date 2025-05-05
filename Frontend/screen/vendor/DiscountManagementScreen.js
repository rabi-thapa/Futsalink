import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const DiscountManagementScreen = ({ route }) => {
  const { venueId } = route.params;
  const VENUE_ENDPOINT = Config.VENUE_ENDPOINT;

  // State for discount
  const [discount, setDiscount] = useState({
    discountPercentage: '',
    validFrom: '',
    validUntil: '',
    description: '',
  });

  // State for loading and date picker visibility
  const [loading, setLoading] = useState(true);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [dateType, setDateType] = useState(''); // Tracks whether the user is selecting 'validFrom' or 'validUntil'

  // Fetch the discount for the selected venue
  const fetchDiscount = async () => {
    try {
      setLoading(true);
      const accessToken = await AsyncStorage.getItem('accessToken');

      if (!accessToken) {
        Alert.alert('Error', 'You need to be logged in');
        return;
      }

      const response = await fetch(`${VENUE_ENDPOINT}/venues/${venueId}/discounts`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();


      console.log("data", data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch discount');
      }

      
      setDiscount({
        ...data.discount,
        discountPercentage: data.discount?.discountPercentage?.toString() || '',
      });
    } catch (error) {
      console.error('Error fetching discount:', error);
      Alert.alert('Error', 'Could not load discount');
    } finally {
      setLoading(false);
    }
  };

  // Handle date selection
  const handleConfirmDate = (date) => {
    const formattedDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    if (dateType === 'validFrom') {
      setDiscount({ ...discount, validFrom: formattedDate });
    } else if (dateType === 'validUntil') {
      setDiscount({ ...discount, validUntil: formattedDate });
    }
    hideDatePicker();
  };

  // Show date picker
  const showDatePicker = (type) => {
    setDateType(type); // Set the type ('validFrom' or 'validUntil')
    setDatePickerVisibility(true);
  };

  // Hide date picker
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  // Save or update the discount
  const saveOrUpdateDiscount = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      if (!accessToken) {
        Alert.alert('Error', 'You need to be logged in');
        return;
      }

      const method = discount._id ? 'PUT' : 'POST'; // Use PUT if discount exists, POST otherwise

      const response = await fetch(`${VENUE_ENDPOINT}/venues/${venueId}/discounts`, {
        method: method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(discount),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save/update discount');
      }

      Alert.alert('Success', 'Discount saved/updated successfully!');
    } catch (error) {
      console.error('Error saving/updating discount:', error);
      Alert.alert('Error', 'Could not save/update discount');
    }
  };

  // Delete the discount
  const deleteDiscount = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      if (!accessToken) {
        Alert.alert('Error', 'You need to be logged in');
        return;
      }

      const response = await fetch(`${VENUE_ENDPOINT}/venues/${venueId}/discounts`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete discount');
      }

      setDiscount({
        discountPercentage: '',
        validFrom: '',
        validUntil: '',
        description: '',
      });

      Alert.alert('Success', 'Discount deleted successfully!');
    } catch (error) {
      console.error('Error deleting discount:', error);
      Alert.alert('Error', 'Could not delete discount');
    }
  };

  useEffect(() => {
    fetchDiscount();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Manage Discount</Text>

      {/* Discount Percentage */}
      <TextInput
        style={styles.input}
        placeholder="Discount Percentage"
        value={discount.discountPercentage.toString()}
        onChangeText={(text) => setDiscount({ ...discount, discountPercentage: text })}
        keyboardType="numeric"
      />

      {/* Valid From Date Picker */}
      <TouchableOpacity style={styles.dateButton} onPress={() => showDatePicker('validFrom')}>
        <Text style={styles.dateText}>
          {discount.validFrom ? `From: ${discount.validFrom}` : 'Select Valid From Date'}
        </Text>
      </TouchableOpacity>

      {/* Valid Until Date Picker */}
      <TouchableOpacity style={styles.dateButton} onPress={() => showDatePicker('validUntil')}>
        <Text style={styles.dateText}>
          {discount.validUntil ? `Until: ${discount.validUntil}` : 'Select Valid Until Date'}
        </Text>
      </TouchableOpacity>

      {/* Description */}
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={discount.description}
        onChangeText={(text) => setDiscount({ ...discount, description: text })}
      />

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={saveOrUpdateDiscount}>
        <Text style={styles.saveButtonText}>
          {discount._id ? 'Update Discount' : 'Save Discount'}
        </Text>
      </TouchableOpacity>

      {/* Delete Button */}
      {discount._id && (
        <TouchableOpacity style={styles.deleteButton} onPress={deleteDiscount}>
          <Text style={styles.deleteButtonText}>Delete Discount</Text>
        </TouchableOpacity>
      )}

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        minimumDate={new Date()}
      />
    </ScrollView>
  );
};

export default DiscountManagementScreen;

// Styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f1fdf3',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  dateButton: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'flex-start',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#dcdcdc',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  saveButton: {
    backgroundColor: '#29B6F6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});





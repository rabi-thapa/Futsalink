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
import moment from 'moment';

const DiscountManagementScreen = ({ route }) => {
  const { venueId } = route.params;
  const VENUE_ENDPOINT = Config.VENUE_ENDPOINT || 'http://10.0.2.2:3000/api';

  const [discount, setDiscount] = useState({
    discountPercentage: '',
    validFrom: '',
    validUntil: '',
    description: '',
  });

  const [loading, setLoading] = useState(true);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [dateType, setDateType] = useState('');

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

  const handleConfirmDate = (date) => {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    if (dateType === 'validFrom') {
      setDiscount({ ...discount, validFrom: formattedDate });
    } else if (dateType === 'validUntil') {
      setDiscount({ ...discount, validUntil: formattedDate });
    }
    hideDatePicker();
  };

  const showDatePicker = (type) => {
    setDateType(type);
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const saveOrUpdateDiscount = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        Alert.alert('Error', 'You need to be logged in');
        return;
      }

      const { discountPercentage, validFrom, validUntil } = discount;

      if (!discountPercentage || isNaN(parseFloat(discountPercentage))) {
        Alert.alert('Validation Error', 'Discount percentage is required and must be a number.');
        return;
      }

      const percentage = parseFloat(discountPercentage);
      if (percentage < 0 || percentage > 100) {
        Alert.alert('Validation Error', 'Discount percentage must be between 0 and 100.');
        return;
      }

      if (!validFrom) {
        Alert.alert('Validation Error', 'Valid From date is required.');
        return;
      }

      if (!validUntil) {
        Alert.alert('Validation Error', 'Valid Until date is required.');
        return;
      }

      const fromDate = new Date(validFrom);
      const untilDate = new Date(validUntil);

      if (isNaN(fromDate.getTime()) || isNaN(untilDate.getTime())) {
        Alert.alert('Validation Error', 'Please select valid dates.');
        return;
      }

      if (untilDate < fromDate) {
        Alert.alert('Validation Error', 'Valid Until date cannot be before Valid From date.');
        return;
      }

      const method = discount._id ? 'PUT' : 'POST';
      const endpoint = `${VENUE_ENDPOINT}/venues/${venueId}/discounts`;

      const response = await fetch(endpoint, {
        method,
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
      Alert.alert('Error', error.message || 'Something went wrong.');
    }
  };

  const deleteDiscount = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
    

      const response = await fetch(`${VENUE_ENDPOINT}/venues/${venueId}/discounts`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      console.log("delete data",data )

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

      <TextInput
        style={styles.input}
        placeholder="Discount Percentage"
        value={discount.discountPercentage.toString()}
        onChangeText={(text) => setDiscount({ ...discount, discountPercentage: text })}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.dateButton} onPress={() => showDatePicker('validFrom')}>
        <Text style={styles.dateText}>
          {discount.validFrom
            ? `From: ${moment(discount.validFrom).format('YYYY-MM-DD')}`
            : 'Select Valid From Date'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.dateButton} onPress={() => showDatePicker('validUntil')}>
        <Text style={styles.dateText}>
          {discount.validUntil
            ? `Until: ${moment(discount.validUntil).format('YYYY-MM-DD')}`
            : 'Select Valid Until Date'}
        </Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Description"
        value={discount.description}
        onChangeText={(text) => setDiscount({ ...discount, description: text })}
      />

      {/* Save/Delete Button Row */}
      {discount.discountPercentage && (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={saveOrUpdateDiscount}>
            <Text style={styles.buttonText}>Update</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={deleteDiscount}>
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      {!discount.discountPercentage && (
        <TouchableOpacity style={styles.saveButtonFull} onPress={saveOrUpdateDiscount}>
          <Text style={styles.buttonText}>Save Discount</Text>
        </TouchableOpacity>
      )}

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

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#f1fdf3',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    color: '#1a1a1a',
    textAlign: 'left',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#b0c9b4',
    borderRadius: 4,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  dateButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderColor: '#b0c9b4',
    borderWidth: 1,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
    color: '#222',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#e53935',
  },
  saveButtonFull: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
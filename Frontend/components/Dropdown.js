// components/Dropdown.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { theme } from '../core/theme';

const Dropdown = ({ selectedValue, onValueChange, items = [], style = {} }) => {
  return (
    <View style={[styles.pickerContainer, style]}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={styles.picker}
        dropdownIconColor="#555"
      >
        {items.map((item) => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>
    </View>
  );
};

export default Dropdown;

const styles = StyleSheet.create({
  pickerContainer: {
    marginTop:  15,
    borderWidth: 1,
    borderColor: 'grey',
    width: '100%',
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
    paddingHorizontal: 10,
  },
});

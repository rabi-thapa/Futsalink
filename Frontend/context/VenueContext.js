import React, {createContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const VenueContext = createContext();

export const VenueProvider = ({children}) => {
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [vendorVenues, setVendorVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch venue details by ID
  const fetchVenueById = async venueId => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error('User not authenticated');

      const response = await fetch(
        `http://10.0.2.2:3000/api/venue/currentVenue/${venueId}`,
        {
          method: 'GET',
          headers: {Authorization: `Bearer ${token}`},
        },
      );

      const data = await response.json();

     

      if (!response.ok)
        throw new Error(data.message || 'Failed to fetch venue');

    

      setSelectedVenue(data.venue);
    } catch (error) {
      console.error('Error fetching venue:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch vendor-specific venues
  const fetchVendorVenues = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`http://10.0.2.2:3000/api/venue/myVenues`, {
        method: 'GET',
        headers: {Authorization: `Bearer ${token}`},
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || 'Failed to fetch vendor venues');

      setVendorVenues(data.venues);
    } catch (error) {
      console.error('Error fetching vendor venues:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch venues with flexible params
  const fetchVenues = async ({
    location = '',
    search = '',
    sortBy = 'location',
    sortOrder = 'asc',
    page = 1,
    limit = 20,
  } = {}) => {
    setLoading(true);
    try {
      let queryParams = new URLSearchParams();

      if (location) queryParams.append('location', location);
      if (search) queryParams.append('search', search);
      if (sortBy) queryParams.append('sortBy', sortBy);
      if (sortOrder) queryParams.append('sortOrder', sortOrder);
      queryParams.append('page', page);
      queryParams.append('limit', limit);

      const response = await fetch(
        `http://10.0.2.2:3000/api/venue?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {'Content-Type': 'application/json'},
        },
      );

      const data = await response.json();

      console.log('fetch venues', data);

      console.log(data);
      if (!response.ok)
        throw new Error(data.message || 'Failed to fetch venues');

      setVenues(data.venues);
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <VenueContext.Provider
      value={{
        venues,
        selectedVenue,
        vendorVenues,
        fetchVenues,
        fetchVenueById,
        fetchVendorVenues,
        loading,
        setLoading
      }}>
      {children}
    </VenueContext.Provider>
  );
};

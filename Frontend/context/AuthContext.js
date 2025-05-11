// AuthContext.js
import React, {createContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
    
        const storedToken = await AsyncStorage.getItem('accessToken');
        const storedRole = await AsyncStorage.getItem('userRole');
  
        if (!storedToken || !storedRole) throw new Error('No token or role found');
  
        setToken(storedToken);
        setUserRole(storedRole);
  
        const response = await fetch('http://10.0.2.2:3000/api/user/current-user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${storedToken}`,
          },
        });
  
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'Failed to fetch user');
  
        setUserData(data.user);
      } catch (error) {
        console.error('Auth Initialization Error:', error);
       
        setToken(null);
        setUserRole(null);
        setUserData(null);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Sign in method
  const signIn = async (newToken, newRole) => {
    try {
      await AsyncStorage.setItem('accessToken', newToken);
      await AsyncStorage.setItem('userRole', newRole);

      setToken(newToken);
      setUserRole(newRole);
      await fetchCurrentUser();
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  // Sign out method
  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('userRole');

      setToken(null);
      setUserRole(null);
      setUserData(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userData,
        userRole,
        token,
        signIn,
        signOut,
        loading,
        checkAuth,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

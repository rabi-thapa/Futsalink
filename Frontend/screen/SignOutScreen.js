import { StyleSheet } from 'react-native';
import React, { useContext, useEffect } from 'react';

import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Paragraph from '../components/Paragraph';
import Button from '../components/Button';
import { AuthContext } from '../context/AuthContext';

const SignOutScreen = ({ navigation }) => {
  const { signOut } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await signOut(); 
      navigation.reset({
        index: 0,
        routes: [{ name: 'Start' }],
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Background>
      <Logo />
      <Header>Confirm Logout</Header>
      <Paragraph style={styles.para}>
        Are you sure you want to log out?
      </Paragraph>
      <Button mode="outlined" onPress={handleLogout}>
        Logout
      </Button>
    </Background>
  );
};



export default SignOutScreen;

const styles = StyleSheet.create({

  para:{
    fontSize: 16,  
    color: 'red',  
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 8, 
  }
});

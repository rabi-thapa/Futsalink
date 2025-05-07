import React from 'react';
import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import Paragraph from '../components/Paragraph';

export default function StartScreen({navigation}) {
  return (
    <Background>
      <Logo />
      <Header>Start</Header>
      <Paragraph>
        Your Game, Your Time – Book Your Futsal Instantly!
      </Paragraph>
      <Button mode="contained" onPress={() => navigation.navigate('SignIn')}>
        Login
      </Button>
      <Button mode="outlined" onPress={() => navigation.navigate('SignUp')}>
        Sign Up
      </Button>
    </Background>
  );
}

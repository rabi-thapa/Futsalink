import React from 'react'
import { Image, StyleSheet } from 'react-native'

export default function Logo2() {
  return <Image source={require('../assets/logo2.png')} style={styles.image} />
}

const styles = StyleSheet.create({
  image: {
    width: 110,
    height: 110,
    marginBottom: 8,
  },
})

import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    ScrollView,
    Image,
    ActivityIndicator,
  } from 'react-native';
  import React, {useEffect, useState, useContext} from 'react';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { AuthContext } from '../context/AuthContext';
  
  const UserProfileDetails = () => {
    const { userData, checkAuth, loading } = useContext(AuthContext);
    const [imageUrl, setImageUrl] = useState('');

    useEffect(()=>{
      checkAuth();
     },[])
  
    useEffect(() => {
        setImageUrl(`http://10.0.2.2:3000/${userData.profileImage}`);
    }, [userData]);


    const getGenderLabel = (gender) => {
      switch (gender) {
        case 'M':
          return 'Male';
        case 'F':
          return 'Female';
        case 'O':
          return 'Other';
        default:
          return 'Unknown';
      }
    };
  
    if (loading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="green" />
        </View>
      );
    }
   
  
    return (
      <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
         
          <View style={styles.leftSection}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.profileImage} />
            ) : (
              <Text>No Image</Text>
            )}
            <Text style={styles.profileName}>
              {`${userData?.firstName || ''} ${userData?.lastName || ''}`.trim()}
            </Text>
            
          </View>

          {/* Right Section - User Details */}
          <View style={styles.rightSection}>
            <Text style={styles.detailText}>Gender: {getGenderLabel(userData?.gender)}</Text>
            <Text style={styles.detailText}>Role: {userData?.role}</Text>
            <Text style={styles.detailText}>
              DOB: {userData?.dateOfBirth ? new Date(userData.dateOfBirth).toDateString() : 'N/A'}
            </Text>
            <Text style={styles.detailText}>Email: {userData?.email}</Text>
            <Text style={styles.detailText}>
              Status: {userData?.status === 1 ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
    );
  };
  export default UserProfileDetails;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F5F5F5',
    },
    scrollContainer: {
      flexGrow: 1,
      alignItems: 'center',
    },
    card: {
      flexDirection: 'row',
      backgroundColor: 'white',
      paddingVertical: 20,
      borderRadius: 6,
      elevation: 3,
      width: '96%',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftSection: {
      width: '45%', 
      alignItems: 'center',
    },
    profileImage: {
      width: 80,
      height: 80,
      borderRadius: 50,
      marginBottom: 10,
    },
    profileName: {
      fontSize: 17,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    profileText: {
      color: 'black',
      fontSize: 17,
      textAlign: 'center',
    },
    rightSection: {
      flex: 1, 
      alignItems: 'flex-start', 
      justifyContent: 'center',
      gap: 10,
    },
    detailText: {
      fontSize: 17,
      marginBottom: 5,
      color: 'black',
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
  
  
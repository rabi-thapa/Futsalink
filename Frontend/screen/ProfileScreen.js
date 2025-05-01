import React, { useEffect, useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { userData, loading, checkAuth, signOut } = useContext(AuthContext);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    checkAuth();
  }, [])
  

 
  // Update profile image URL when user data is available
  useEffect(() => {
    console.log("user data in profie apge", userData)
    if (userData?.profileImage) {
      setImageUrl(`http://10.0.2.2:3000/${userData.profileImage}`);
    } 
  }, [userData]);


  const handleLogout = async () => {
    try {
      await signOut(); // Call the signOut method from AuthContext
      navigation.reset({
        index: 0,
        routes: [{name: 'SignIn'}],
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  const MenuItem = ({icon, title, onPress}) => {
    return (
      <View style={styles.menuItemContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          activeOpacity={0.6}
          onPress={onPress}>
          <AntDesign name={icon} size={24} color={'green'} />
          <Text style={styles.menuText}>{title}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView>
      {/* Profile Section */}
      <View style={styles.profileContainer}>
        {imageUrl && imageUrl.length > 0 ? (
          <Image
            key={imageUrl}
            source={{uri: imageUrl}}
            style={styles.profileImage}
          />
        ) : (
          <Text>No Profile Image</Text>
        )}

        <Text style={styles.profileName}>
          {`${userData?.firstName || ''} ${userData?.lastName || ''}`.trim()}
        </Text>
        <Text style={styles.profileText}>{userData?.email}</Text>
        <Text style={styles.profileText}>{userData?.phone}</Text>
      </View>

      {/* Menu Options */}
      <View style={styles.menuContainer}>
        <MenuItem
          icon="user"
          title="View Profile Details"
          onPress={() => navigation.navigate('UserProfileDetails')}
        />
        <MenuItem
          icon="edit"
          title="Update Profile"
          onPress={() => navigation.navigate('UpdateProfile')}
        />
        <MenuItem
          icon="lock"
          title="Change Password"
          onPress={() => navigation.navigate('ChangePassword')}
        />
        <MenuItem icon="calendar" title="View My Bookings" />
        <MenuItem icon="tag" title="Offers" />
        <MenuItem icon="delete" title="Deactivate/Delete Account" />
        <MenuItem icon="logout" title="Logout" onPress={handleLogout} />
      </View>
    </ScrollView>
  </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  profileContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  profileText: {
    color: 'gray',
  },
  menuContainer: {
    marginTop: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    margin: 12,
  },
  menuItemContainer: {
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderColor: '#E0E0E0',
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  menuText: {
    fontSize: 17,
    fontWeight: '500',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

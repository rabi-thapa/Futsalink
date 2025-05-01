import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://10.0.2.2:3000/api";




const fetchWithAuth = async (url, options = {}) => {
  let accessToken = await AsyncStorage.getItem("accessToken");

  if (!accessToken) {
    console.log("🔄 No access token, trying to refresh...");
    if (!accessToken) {
      throw new Error("Session expired, please log in again.");
    }
  }

  let response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

   if (response.status === 401) {
       
        if (!accessToken) {
            throw new Error("Session expired, please log in again.");
        }

        response = await fetch(`${API_URL}${url}`, {
            ...options,
            headers: {
                ...options.headers,
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });
    }

  return response;
};



const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert("Please enter old and new passwords");
      return;
    }
  
    try {
      setLoading(true);
  
      const userId = await AsyncStorage.getItem("userId");
  
      const response = await fetchWithAuth("/user/changePassword", {
        method: "POST",
        body: JSON.stringify({ userId, oldPassword, newPassword }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        Alert.alert("Success", "Password changed successfully.");
        navigation.replace("SignIn");
    } else {
        Alert.alert("Error", data.message || "Password change failed.");
    }
    } catch (error) {
      Alert.alert("Change Password Failed", error.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        {/* <Text style={styles.heading}>Change Password</Text> */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Old password</Text>
          <TextInput
            style={styles.input}
            placeholder="old password"
            value={oldPassword}
            onChangeText={setOldPassword}
            autoCapitalize="none"
          />
          <Text style={styles.label}>New password</Text>
          <TextInput
            style={styles.input}
            placeholder="new password"
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </View>
        <Pressable
          style={[
            styles.changePasswordButton,
            oldPassword.length > 2 && newPassword.length > 2
              ? styles.changePasswordButtonActive
              : styles.changePasswordButtonInactive,
          ]}
          onPress={handleChangePassword}
          disabled={loading || oldPassword.length < 2 || newPassword.length < 2}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.changePasswordButtonText}>Change Password</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  innerContainer: { padding: 13 },
  heading: { fontSize: 22, fontWeight: "500" },
  inputContainer: { flexDirection: "column", gap: 16, marginVertical: 10 },
  label: { fontSize: 18, fontWeight: "500", color: "#333" },
  input: { padding: 15, borderColor: "#D0D0D0", borderWidth: 1, borderRadius: 10, fontSize: 16 },
  changePasswordButtonText: { textAlign: "center", fontSize: 16 },
  changePasswordButton: { padding: 15 },
  changePasswordButtonActive: { backgroundColor: "#2dcf30" },
  changePasswordButtonInactive: { backgroundColor: "#E0E0E0" },
});

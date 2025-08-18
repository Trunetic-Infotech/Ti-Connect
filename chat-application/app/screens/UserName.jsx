import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

const API_URL = "http://192.168.1.43:5000";
const UserName = () => {
  const [user, setUser] = useState([])
  const [image, setImage] = useState(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [imgUrl, setImgUrl] = useState(null);

  const fetcgUserNameAndProfilePicture = async()=>{

      const token = await SecureStore.getItemAsync("token");
      // console.log("Hllo", token);
      
    try {
      const response = await axios.get(`${API_URL}/api/v1/get/userName/profile-picture`, {
        headers:{
          Authorization: `Bearer ${token}`,
        }
      })

      if(response.data && response.data.data){
        // setUserName(response.data.data.username);
        // setImage(response.data.data.profile_picture);
        // setUser(response.data.data)
        // console.log(response.data.data);

        const userData = response.data.data[0];
        console.log(userData);
        
        setUserName(userData.username || "");
        setImage(userData.profile_picture || null)
        
      }else{

      }
    } catch (error) {
      console.log(error);
      
    }
  }

  useEffect(()=>{
    fetcgUserNameAndProfilePicture()
  },[])

 

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need permission to access media.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleContinue = async () => {
    if (!userName.trim()) {
      Alert.alert("Name Required", "Please enter your name.");
      return;
    }

    try {
      setLoading(true);

      const token = await SecureStore.getItemAsync("token");
      const userId = await SecureStore.getItemAsync("userId");

      const response = await axios.patch(
          // AsyncStorage
    // await AsyncStorage.clear()
        `${API_URL}/api/v1/users/setName/${userId}`,
        { username: userName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        Alert.alert("Success", "Name added successfully!");
        router.push("/screens/BottomNavigation/TabHomeScreen");
      } else {
        Alert.alert("Error", "Failed to add name.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add name.");
      console.error("Error adding name:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async () => {
    if (!image) {
      Alert.alert("No Image", "Please select an image first.");
      return;
    }

    try {
      setLoading(true);

      const token = await SecureStore.getItemAsync("token");
      const userId = await SecureStore.getItemAsync("userId");

      const formData = new FormData();
      formData.append("profile_picture", {
        uri: image,
        name: "profile_picture.jpg",
        type: "image/jpeg",
      });

      const response = await axios.patch(
        `${API_URL}/api/v1/profile/upload/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        Alert.alert("Success", "Profile picture updated!");
      } else {
        Alert.alert("Error", "Failed to update profile picture.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add Profile Pic.");
      console.error("Error adding Profile Pic:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 px-6 pt-12 bg-[#f0f9ff]">
      <Text className="text-3xl font-extrabold text-indigo-700 text-center mb-10">
        Create Profile
      </Text>

      <View className="items-center mb-8">
        <TouchableOpacity onPress={pickImage} activeOpacity={0.9}>
          <View className="w-36 h-36 rounded-full bg-indigo-100 justify-center items-center border-4 border-indigo-300 relative">
            {image ? (
              <Image
                source={{ uri: image }}
                className="w-full h-full rounded-full"
              />
            ) : (
              <FontAwesome5 name="user-alt" size={40} color="#6366f1" />
            )}
            <View className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow">
              <Feather name="edit-2" size={16} color="#6366f1" />
            </View>
          </View>
        </TouchableOpacity>
        <Text className="text-sm text-gray-500 mt-2">Tap photo to edit</Text>
      </View>

      <TextInput
        value={userName}
        onChangeText={setUserName}
        placeholder="Enter your name"
        placeholderTextColor="#999"
        className="bg-white px-4 py-4 rounded-xl text-base text-gray-800 border border-gray-300 shadow-sm mb-6"
      />

      <TouchableOpacity
        onPress={handleContinue}
        disabled={loading}
        activeOpacity={0.9}
        className="bg-indigo-600 py-4 rounded-full shadow-md mb-4"
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-center text-white font-bold text-lg tracking-wide">
            Continue
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={uploadImage}
        disabled={loading}
        activeOpacity={0.9}
        className="bg-green-600 py-4 rounded-full shadow-md"
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-center text-white font-bold text-lg tracking-wide">
            Upload Profile Picture
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default UserName;

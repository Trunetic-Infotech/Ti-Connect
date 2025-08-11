import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

const UserName = () => {
  const [image, setImage] = useState(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleContinue = () => {
    if (!userName.trim()) {
      Alert.alert("Name Required", "Please enter your name.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/screens/BottomNavigation/TabHomeScreen");
    }, 2000);
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
        className="bg-indigo-600 py-4 rounded-full shadow-md"
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-center text-white font-bold text-lg tracking-wide">
            Continue
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default UserName;

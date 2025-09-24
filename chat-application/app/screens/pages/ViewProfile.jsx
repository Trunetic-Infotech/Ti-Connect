import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome, FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector } from "react-redux";
import axios from "axios";
import { ScrollView } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

const ViewProfile = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  let user = params.user;

  try {
    if (typeof user === "string") {
      user = JSON.parse(user);
    }
  } catch (e) {
    console.warn("Failed to parse user param:", e);
  }

  const [name, setName] = useState(user?.username || "Aman Verma");
  const [bio, setBio] = useState(user?.bioDescription || "Busy with work");
  const [phone, setPhone] = useState(user?.phone_number || "557993469");
  const [image, setImage] = useState(
    user?.profile_picture
      ? { uri: user.profile_picture }
      : require("../../../assets/images/dp.jpg")
  );

  const [email, setEmail] = useState(user?.email || "");
  const [emailSaved, setEmailSaved] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  const saveEmail = async () => {
    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      console.log("No token found → redirecting to login");
      router.replace("/screens/home");
      return;
    }
    const trimmedEmail = email.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

    if (!isValid) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    try {
      const res = await axios.patch(
        `${process.env.EXPO_API_URL}/save/email`,
        { email: trimmedEmail },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.success) {
        Alert.alert("Email Saved", "Your email has been saved successfully.");
        setEmailSaved(true);
        setIsEditingEmail(false);
      } else {
        Alert.alert(
          "Email Save Failed",
          res.data?.message || "Please try again."
        );
      }
    } catch (error) {
      console.error("Save email error:", error);
      const message =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      Alert.alert("Error", message);
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.granted === false) {
      Alert.alert(
        "Permission Denied",
        "Permission to access gallery is required!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const UploadImageHandler = async () => {
    if (!image) {
      Alert.alert("No Image Selected", "Please select an image first!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("profile_picture", {
        uri: typeof image === "string" ? image : image.uri,
        name: "profile.jpg",
        type: "image/jpeg",
      });

      const token = await AsyncStorage.getItem("token");
      if (!token) return router.replace("/screens/home");

      const response = await axios.patch(
        `${process.env.EXPO_API_URL}/update/profile`,
        formData, // Pass FormData directly
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data?.success) {
        Alert.alert(
          "Profile Updated",
          "Your profile has been updated successfully."
        );
      } else {
        Alert.alert(
          "Profile Update Failed",
          response.data?.message || "Please try again."
        );
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const updateProfile = async () => {
    try {
      const res = await axios.patch(
        `${process.env.EXPO_API_URL}/update/profile`,
        {
          username: name,
          bioDescription: bio,
          phone_number: phone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.success) {
        Alert.alert(
          "Profile Updated",
          "Your profile has been updated successfully."
        );
        setIsEditingProfile(false);
      } else {
        Alert.alert(
          "Profile Update Failed",
          res.data?.message || "Please try again."
        );
      }
    } catch (error) {
      console.error("Update profile error:", error);
      const message =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      Alert.alert("Error", message);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      {/* Header */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 pt-8"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={isEditingProfile || isEditingEmail} // ✅ scroll only when editing
        >
          <LinearGradient
            colors={["#6366f1", "#8b5cf6", "#ec4899"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="h-48 rounded-b-[50px] shadow-lg relative"
          >
            <View className="flex-row items-center justify-between px-5 pt-8">
              <TouchableOpacity
                onPress={() => router.back()}
                className="p-2 rounded-full bg-white/20 active:opacity-70"
              >
                <FontAwesome6 name="arrow-left-long" size={22} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-xl  font-bold justify-center">
                My Profile
              </Text>
              <View />
            </View>
          </LinearGradient>

          {/* Profile Picture */}
          <View className="items-center -mt-20">
            <View className="relative" onPress={UploadImageHandler}>
              <Image
                source={image}
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  borderWidth: 5,
                  borderColor: "#fff",
                  shadowColor: "#8b5cf6",
                  shadowOpacity: 0.4,
                  shadowRadius: 15,
                  elevation: 10,
                }}
              />
              <TouchableOpacity
                onPress={pickImage}
                className="absolute bottom-2 right-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full p-2 shadow-md"
              >
                <FontAwesome5 name="camera" size={26} color="#0000FF" />
              </TouchableOpacity>
            </View>

            {/* <TouchableOpacity onPress={UploadImageHandler} className="mt-5 bg-blue-500 p-3 rounded">
        <Text className="text-white font-bold">Upload Image</Text>
      </TouchableOpacity> */}
          </View>

          {/* Name and Status */}
          <View className="items-center">
            <Text className="text-xl font-semibold text-gray-800 mt-3">
              {name}
            </Text>
            <Text className="text-sm text-gray-500">
              {user?.status === "active" ? "🟢 Online" : "⚫ Offline"}
            </Text>
          </View>

          {/* Body */}

          {/* Profile Info Section */}
          <View className="bg-white/90 rounded-2xl mt-8 p-6 shadow-lg">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-gray-600 uppercase">
                Personal Info
              </Text>
              {!isEditingProfile ? (
                <TouchableOpacity
                  onPress={() => setIsEditingProfile(true)}
                  className="px-3 py-1 rounded-full bg-blue-500"
                >
                  <Text className="text-white text-sm font-medium">Edit</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => setIsEditingProfile(false)}
                  className="px-3 py-1 rounded-full bg-gray-400 flex-row items-center"
                >
                  <FontAwesome name="close" size={24} color="white" />
                  <Text className="text-white text-sm ml-1">Cancel</Text>
                </TouchableOpacity>
              )}
            </View>

            {!isEditingProfile ? (
              <>
                <Text className="text-gray-400 font-medium text-sm uppercase mb-1">
                  Phone Number
                </Text>
                <Text className="text-lg font-semibold text-gray-900 mb-4">
                  +91 {phone}
                </Text>

                <Text className="text-gray-400 font-medium text-sm uppercase mb-1">
                  About Me
                </Text>
                <Text className="text-base text-gray-700">{bio}</Text>
              </>
            ) : (
              <>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  className="border px-4 py-3 rounded-lg mb-4"
                  placeholder="Enter Name"
                />
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  className="border px-4 py-3 rounded-lg mb-4"
                  placeholder="Enter Bio"
                />
                <TouchableOpacity
                  onPress={updateProfile}
                  className="py-3 rounded-full items-center shadow bg-blue-600"
                >
                  <Text className="text-white font-semibold text-base">
                    Save Profile
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Backup Email Section */}
          <View className="bg-white/90 rounded-2xl p-6 shadow-lg mt-8 border border-gray-200">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-gray-600 uppercase">
                Backup Email
              </Text>
              {!isEditingEmail ? (
                <TouchableOpacity
                  onPress={() => setIsEditingEmail(true)}
                  className="px-3 py-1 rounded-full bg-blue-500"
                >
                  <Text className="text-white text-sm font-medium">Edit</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    setIsEditingEmail(false);
                    setEmail(user?.email || "");
                  }}
                  className="px-3 py-1 rounded-full bg-gray-400 flex-row items-center"
                >
                  <FontAwesome name="close" size={24} color="white" />
                  <Text className="text-white text-sm ml-1">Cancel</Text>
                </TouchableOpacity>
              )}
            </View>

            <TextInput
              placeholder="Enter your email"
              placeholderTextColor="#999"
              className="border px-4 py-3 rounded-lg mb-4"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailSaved(false);
              }}
              editable={isEditingEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
                backgroundColor: isEditingEmail ? "#fff" : "#f9fafb",
                borderColor: "#e5e7eb",
                color: "#1f2937",
              }}
            />

            {isEditingEmail && (
              <TouchableOpacity
                onPress={saveEmail}
                disabled={emailSaved}
                className={`py-3 rounded-full items-center shadow ${
                  emailSaved ? "bg-green-500" : "bg-blue-600"
                }`}
              >
                <Text className="text-white font-semibold text-base">
                  {emailSaved ? "Saved ✔" : "Save Email"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ViewProfile;

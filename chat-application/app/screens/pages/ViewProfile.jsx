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

  // Get dark mode from Redux
  const darkMode = useSelector((state) => state.theme.darkMode);

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

  // Theme colors — only colors change, layout stays 100% same
  const colors = {
    background: darkMode ? "#111111" : "#ffffff",
    cardBg: darkMode ? "#1f1f1f" : "#ffffff",
    cardBorder: darkMode ? "#333333" : "#e5e7eb",
    text: darkMode ? "#f5f5f5" : "#1f2937",
    textSecondary: darkMode ? "#bbbbbb" : "#6b7280",
    textMuted: darkMode ? "#888888" : "#9ca3af",
    inputBg: darkMode ? "#2a2a2a" : "#f9fafb",
    inputBorder: darkMode ? "#444444" : "#e5e7eb",
    placeholder: darkMode ? "#888888" : "#999999",
  };

  const saveEmail = async () => {
    const token = await SecureStore.getItemAsync("token");
    if (!token) {
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
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.success) {
        Alert.alert("Email Saved", "Your email has been saved successfully.");
        setEmailSaved(true);
        setIsEditingEmail(false);
      } else {
        Alert.alert("Email Save Failed", res.data?.message || "Please try again.");
      }
    } catch (error) {
      console.error("Save email error:", error);
      const message = error.response?.data?.message || "Something went wrong.";
      Alert.alert("Error", message);
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Denied", "Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage({ uri: result.assets[0].uri });
    }
  };

  const UploadImageHandler = async () => {
    if (!image || typeof image === "string") {
      Alert.alert("No Image Selected", "Please select an image first!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("profile_picture", {
        uri: image.uri,
        name: "profile.jpg",
        type: "image/jpeg",
      });

      const token = await AsyncStorage.getItem("token");
      if (!token) return router.replace("/screens/home");

      const response = await axios.patch(
        `${process.env.EXPO_API_URL}/update/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data?.success) {
        Alert.alert("Profile Updated", "Your profile has been updated successfully.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const updateProfile = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) return router.replace("/screens/home");

      const res = await axios.patch(
        `${process.env.EXPO_API_URL}/update/profile`,
        {
          username: name,
          bioDescription: bio,
          phone_number: phone,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.success) {
        Alert.alert("Profile Updated", "Your profile has been updated successfully.");
        setIsEditingProfile(false);
      }
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to update.");
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={isEditingProfile || isEditingEmail}
        >
          {/* Gradient Header */}
          <LinearGradient
            colors={["#6366f1", "#8b5cf6", "#ec4899"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="h-48 rounded-b-[50px] shadow-lg relative"
          >
            <View className="flex-row items-center justify-between px-5 pt-8">
              <TouchableOpacity
                onPress={() => router.back()}
                className="p-2 rounded-full bg-white/20"
              >
                <FontAwesome6 name="arrow-left-long" size={22} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-xl font-bold">My Profile</Text>
              <View />
            </View>
          </LinearGradient>

          {/* Profile Picture */}
          <View className="items-center -mt-20">
            <View className="relative">
              <Image
                source={typeof image === "string" ? { uri: image } : image}
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  borderWidth: 5,
                  borderColor: darkMode ? "#333" : "#fff",
                  backgroundColor: "#333",
                }}
              />
              <TouchableOpacity
                onPress={pickImage}
                className="absolute bottom-2 right-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full p-2 shadow-md"
              >
                <FontAwesome5 name="camera" size={26} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Name & Status */}
          <View className="items-center mt-4">
            <Text className="text-2xl font-bold" style={{ color: colors.text }}>
              {name}
            </Text>
            <Text style={{ color: colors.textSecondary }}>
              {user?.status === "active" ? "Online" : "Offline"}
            </Text>
          </View>

          {/* Personal Info Card */}
          <View
            className="mx-5 mt-8 rounded-2xl p-6 shadow-lg"
            style={{ backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.cardBorder }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm font-bold uppercase" style={{ color: colors.textMuted }}>
                Personal Info
              </Text>
              {!isEditingProfile ? (
                <TouchableOpacity
                  onPress={() => setIsEditingProfile(true)}
                  className="px-4 py-2 rounded-full bg-indigo-600"
                >
                  <Text className="text-white text-sm font-medium">Edit</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-full bg-red-600 flex-row items-center gap-2"
                >
                  <FontAwesome name="close" size={18} color="white" />
                  <Text className="text-white text-sm">Cancel</Text>
                </TouchableOpacity>
              )}
            </View>

            {!isEditingProfile ? (
              <>
                <Text className="text-sm uppercase mb-1" style={{ color: colors.textMuted }}>
                  Phone Number
                </Text>
                <Text className="text-lg font-semibold mb-6" style={{ color: colors.text }}>
                  +91 {phone}
                </Text>

                <Text className="text-sm uppercase mb-1" style={{ color: colors.textMuted }}>
                  About Me
                </Text>
                <Text className="text-base" style={{ color: colors.textSecondary }}>
                  {bio}
                </Text>
              </>
            ) : (
              <>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter Name"
                  placeholderTextColor={colors.placeholder}
                  className="px-4 py-3 rounded-lg mb-4 text-base"
                  style={{ backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.inputBorder, color: colors.text }}
                />
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Enter Bio"
                  placeholderTextColor={colors.placeholder}
                  className="px-4 py-3 rounded-lg mb-6 text-base"
                  style={{ backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.inputBorder, color: colors.text }}
                />
                <TouchableOpacity
                  onPress={updateProfile}
                  className="py-3 rounded-full bg-indigo-600"
                >
                  <Text className="text-white font-bold text-center">Save Profile</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Email Section */}
          <View
            className="mx-5 mt-8 rounded-2xl p-6 shadow-lg"
            style={{ backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.cardBorder }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm font-bold uppercase" style={{ color: colors.textMuted }}>
                Backup Email
              </Text>
              {!isEditingEmail ? (
                <TouchableOpacity
                  onPress={() => setIsEditingEmail(true)}
                  className="px-4 py-2 rounded-full bg-indigo-600"
                >
                  <Text className="text-white text-sm font-medium">Edit</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    setIsEditingEmail(false);
                    setEmail(user?.email || "");
                  }}
                  className="px-4 py-2 rounded-full bg-red-600 flex-row items-center gap-2"
                >
                  <FontAwesome name="close" size={18} color="white" />
                  <Text className="text-white text-sm">Cancel</Text>
                </TouchableOpacity>
              )}
            </View>

            <TextInput
              placeholder="Enter your email"
              placeholderTextColor={colors.placeholder}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailSaved(false);
              }}
              editable={isEditingEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="px-4 py-3 rounded-lg mb-4 text-base"
              style={{
                backgroundColor: isEditingEmail ? colors.inputBg : colors.cardBg,
                borderWidth: 1,
                borderColor: colors.inputBorder,
                color: colors.text,
              }}
            />

            {isEditingEmail && (
              <TouchableOpacity
                onPress={saveEmail}
                disabled={emailSaved}
                className={`py-3 rounded-full ${emailSaved ? "bg-green-600" : "bg-indigo-600"}`}
              >
                <Text className="text-white font-bold text-center">
                  {emailSaved ? "Saved" : "Save Email"}
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
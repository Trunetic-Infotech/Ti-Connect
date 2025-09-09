import React, { use, useState } from "react";
import {
  View,
  Text,
  Switch,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "../../redux/features/auth";
import axios from "axios";

const Setting = () => {
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [email, setEmail] = useState("");
  const [emailSaved, setEmailSaved] = useState(false);
  const dispatch = useDispatch();

  const colors = {
    background: darkMode ? "#121212" : "#ffffff",
    text: darkMode ? "#f5f5f5" : "#1f2937",
    secondaryText: darkMode ? "#bbbbbb" : "#6b7280",
    border: darkMode ? "#333333" : "#e5e7eb",
    inputBg: darkMode ? "#1e1e1e" : "#ffffff",
  };

  
  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_API_URL}/logout`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data?.success) {
        Alert.alert("Logged Out", "You have been logged out.");
        dispatch(setToken(null));
        dispatch(setUser(null));
        router.replace("/screens/home");
      } else {
        Alert.alert("Logout Failed", "Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
    Alert.alert("Logout Error", "Something went wrong. Please try again.");
  }
};


const saveEmail = async () => {
  // Trim to avoid accidental spaces
  const trimmedEmail = email.trim();

  // Better validation
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
    } else {
      Alert.alert(
        "Email Save Failed",
        res.data?.message || "Please try again."
      );
    }
  } catch (error) {
    console.error("Save email error:", error);

    const message =
      error.response?.data?.message || "Something went wrong. Please try again.";

    Alert.alert("Error", message);
  }
};

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={["top", "bottom"]}
    >
      <ScrollView
        className="px-4 py-6"
        style={{ backgroundColor: colors.background }}
      >
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>
            Settings
          </Text>
          <Ionicons
            name="close"
            size={24}
            color="#3b82f6"
            onPress={() => router.back()}
          />
        </View>

        {/* Profile */}
        <TouchableOpacity
          className="flex-row items-center gap-4 mb-6"
          onPress={() => router.push("/screens/pages/ProfileEdit")}
        >
          <Image
            source={user?.profile_picture ? { uri: user.profile_picture } : require("../../../assets/images/dp.jpg")}
            style={{ width: 60, height: 60, borderRadius: 30 }}
          />
          <View>
            <Text
              className="text-lg font-semibold"
              style={{ color: colors.text }}
            >
             {user?.username || "Name not Define"}
            </Text>
              <Text
              className="text-lg font-semibold"
              style={{ color: colors.text }}
            >
             {user?.phone_number || "phone_number not Define"}
            </Text>
            <Text className="text-sm" style={{ color: colors.secondaryText }}>
              Tap to edit profile
            </Text>
          </View>
        </TouchableOpacity>

        {/* Preferences */}
        <View
          className="border-t pt-4 mb-6"
          style={{ borderColor: colors.border }}
        >
          <Text
            className="text-sm font-medium mb-2"
            style={{ color: colors.secondaryText }}
          >
            PREFERENCES
          </Text>

          <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center gap-3">
              <Feather name="moon" size={20} color="#3b82f6" />
              <Text className="text-base" style={{ color: colors.text }}>
                Dark Mode
              </Text>
            </View>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>

          <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center gap-3">
              <Feather name="bell" size={20} color="#3b82f6" />
              <Text className="text-base" style={{ color: colors.text }}>
                Notifications
              </Text>
            </View>
            <Switch value={notifications} onValueChange={setNotifications} />
          </View>

          <TouchableOpacity
            className="flex-row items-center justify-between py-3"
            onPress={() =>
              Alert.alert("Coming Soon", "Wallpaper customization")
            }
          >
            <View className="flex-row items-center gap-3">
              <Feather name="image" size={20} color="#3b82f6" />
              <Text className="text-base" style={{ color: colors.text }}>
                Chat Wallpaper
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#aaa" />
          </TouchableOpacity>
        </View>

        {/* Account */}
        <View
          className="border-t pt-4 mb-6"
          style={{ borderColor: colors.border }}
        >
          <Text
            className="text-sm font-medium mb-2"
            style={{ color: colors.secondaryText }}
          >
            ACCOUNT
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/screens/pages/ProfileEdit")}
            className="flex-row items-center justify-between py-3"
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="call" size={20} color="#3b82f6" />
              <Text className="text-base" style={{ color: colors.text }}>
                Change Phone Number
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#aaa" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/screens/pages/PrivacyPage")}
            className="flex-row items-center justify-between py-3"
          >
            <View className="flex-row items-center gap-3">
              <Feather name="lock" size={20} color="#3b82f6" />
              <Text className="text-base" style={{ color: colors.text }}>
                Privacy
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#aaa" />
          </TouchableOpacity>
        </View>

        {/* Backup */}
        <View
          className="border-t pt-4 mb-6"
          style={{ borderColor: colors.border }}
        >
          <Text
            className="text-sm font-medium mb-2"
            style={{ color: colors.secondaryText }}
          >
            BACKUP
          </Text>

          <View className="space-y-3">
            <View>
              <Text className="text-base mb-1" style={{ color: colors.text }}>
                Backup Email
              </Text>
            </View>
            <View className="flex gap-4">
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#999"
                className="border px-4 py-2 rounded-lg"
                style={{
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.inputBg,
                }}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailSaved(false);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />

             <TouchableOpacity
  onPress={saveEmail}
  disabled={emailSaved} // disable after success
  className={`py-3 my-0 mx-auto w-52 rounded-full items-center shadow ${
    emailSaved ? "bg-green-500" : "bg-blue-500"
  }`}
>
  <Text className="text-white font-semibold text-base">
    {emailSaved ? "Saved ✔" : "Save Email"}
  </Text>
</TouchableOpacity>
            </View>
          </View>
        </View>

        {/* About */}
        <View
          className="border-t pt-4 mb-6"
          style={{ borderColor: colors.border }}
        >
          <Text
            className="text-sm font-medium mb-2"
            style={{ color: colors.secondaryText }}
          >
            ABOUT
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/screens/pages/AboutAppInformation")}
            className="flex-row items-center justify-between py-3"
          >
            <View className="flex-row items-center gap-3">
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#3b82f6"
              />
              <Text className="text-base" style={{ color: colors.text }}>
                About App
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#aaa" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("screens/pages/HelpCenter")}
            className="flex-row items-center justify-between py-3"
          >
            <View className="flex-row items-center gap-3">
              <Feather name="help-circle" size={20} color="#3b82f6" />
              <Text className="text-base" style={{ color: colors.text }}>
                Help & Support
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#aaa" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              handleLogout();
            }}
            className="flex-row items-center justify-between py-3"
          >
            <View className="flex-row items-center gap-3">
              <MaterialIcons name="logout" size={20} color="#ef4444" />
              <Text className="text-base font-medium text-red-600">Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Setting;

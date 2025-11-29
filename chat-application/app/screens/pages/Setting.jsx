import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { setToken, setUser } from "../../redux/features/auth";
import axios from "axios";
import { disconnectSocket } from "./../../services/socketService";
import * as SecureStore from "expo-secure-store";

const SettingItem = ({ icon, label, onPress, color = "#3b82f6", rightArrow = true }) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center justify-between py-3"
  >
    <View className="flex-row items-center gap-3">
      {icon}
      <Text className="text-base">{label}</Text>
    </View>
    {rightArrow && <Feather name="chevron-right" size={20} color="#aaa" />}
  </TouchableOpacity>
);

const Setting = () => {
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const dispatch = useDispatch();

  const colors = {
    background: darkMode ? "#121212" : "#ffffff",
    text: darkMode ? "#f5f5f5" : "#1f2937",
    secondaryText: darkMode ? "#bbbbbb" : "#6b7280",
    border: darkMode ? "#333333" : "#e5e7eb",
  };

  const clearStorage = async () => {
    await SecureStore.deleteItemAsync("token");
  };

  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await axios.post(
              `${process.env.EXPO_API_URL}/logout`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data?.success) {
              dispatch(setToken(null));
              dispatch(setUser(null));
              disconnectSocket();
              clearStorage();
              router.replace("/screens/home");
            } else {
              Alert.alert("Logout Failed", "Please try again.");
            }
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Something went wrong. Please try again.");
          }
        },
      },
    ]);
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
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>
            Settings
          </Text>
          {/* <Ionicons
            name="close"
            size={24}
            color="#3b82f6"
            onPress={() => router.back()}
          /> */}
        </View>

        {/* Profile */}
        <TouchableOpacity
          className="flex-row items-center gap-4 mb-6"
          onPress={() =>
            router.push({
              pathname: "/screens/pages/ViewProfile",
              params: { user: JSON.stringify(user) },
            })
          }
        >
          <Image
            source={
              user?.profile_picture
                ? { uri: user.profile_picture }
                : require("../../../assets/images/dp.jpg")
            }
            style={{ width: 60, height: 60, borderRadius: 30 }}
          />
          <View>
            <Text
              className="text-lg font-semibold"
              style={{ color: colors.text }}
            >
              {user?.username || "Unknown User"}
            </Text>
            <Text
              className="text-sm"
              style={{ color: colors.secondaryText }}
            >
              {user?.phone_number || "No phone linked"}
            </Text>
            <Text className="text-xs" style={{ color: colors.secondaryText }}>
              Tap to view profile
            </Text>
          </View>
        </TouchableOpacity>

        {/* Preferences */}
        <View className="border-t pt-2 mb-2" style={{ borderColor: colors.border }}>
          <Text className="text-sm font-medium" style={{ color: colors.secondaryText }}>
            PREFERENCES
          </Text>

          <View className="flex-row items-center justify-between ">
            <View className="flex-row items-center gap-3">
              <Feather name="moon" size={20} color="#3b82f6" />
              {/* TODO: Add Global Context for theme */}
              <Text className="text-base" style={{ color: colors.text }}>
                Dark Mode
              </Text>
            </View>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Feather name="bell" size={20} color="#3b82f6" />
              <Text className="text-base" style={{ color: colors.text }}>
                Notifications
              </Text>
            </View>
            <Switch value={notifications} onValueChange={setNotifications} />
          </View>
        </View>

        {/* Account */}
        <View className="border-t pt-4" style={{ borderColor: colors.border }}>
          <Text
            className="text-sm font-medium mb-2"
            style={{ color: colors.secondaryText }}
          >
            ACCOUNT
          </Text>
          <SettingItem
            icon={<Feather name="lock" size={20} color="#3b82f6" />}
            label="Privacy"
            onPress={() => router.push("/screens/pages/PrivacyPage")}
          />
        </View>

        {/* About */}
        <View className="border-t pt-4 mb-6" style={{ borderColor: colors.border }}>
          <Text
            className="text-sm font-medium mb-2"
            style={{ color: colors.secondaryText }}
          >
            ABOUT
          </Text>

          <SettingItem
            icon={<Ionicons name="information-circle-outline" size={20} color="#3b82f6" />}
            label="About App"
            onPress={() => router.push("/screens/pages/AboutAppInformation")}
          />
          <SettingItem
            icon={<Feather name="help-circle" size={20} color="#3b82f6" />}
            label="Help & Support"
            onPress={() => router.push("/screens/pages/HelpCenter")}
          />

          {/* Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center gap-3 mt-4"
          >
            <MaterialIcons name="logout" size={20} color="#ef4444" />
            <Text className="text-base font-medium text-red-600">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Setting;

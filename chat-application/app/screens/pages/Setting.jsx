import React, { useState } from "react";
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

const Setting = () => {
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [email, setEmail] = useState("");
  const [emailSaved, setEmailSaved] = useState(false);

  const handleLogout = () => {
    Alert.alert("Logout", "You have been logged out.");
  };

  const saveEmail = () => {
    const isValid = /\S+@\S+\.\S+/.test(email);
    if (!isValid) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    setEmailSaved(true);
    Alert.alert("Email Saved", `Your backup email is set to ${email}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <ScrollView className="px-4 py-6">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-gray-800">Settings</Text>
          <Ionicons
            name="close"
            size={24}
            color="#3b82f6"
            onPress={() => router.back()}
          />
        </View>
        <TouchableOpacity
          className="flex-row items-center gap-4 mb-6"
          onPress={() => router.push("/screens/pages/ProfileEdit")}
        >
          <Image
            source={require("../../../assets/images/dp.jpg")}
            style={{ width: 60, height: 60, borderRadius: 30 }}
          />
          <View>
            <Text className="text-lg font-semibold text-gray-800">
              Aman Verma
            </Text>
            <Text className="text-sm text-gray-500">Tap to edit profile</Text>
          </View>
        </TouchableOpacity>
        <View className="border-t border-gray-200 pt-4 mb-6">
          <Text className="text-sm font-medium text-gray-500 mb-2">
            PREFERENCES
          </Text>

          <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center gap-3">
              <Feather name="moon" size={20} color="#3b82f6" />
              <Text className="text-base text-gray-800">Dark Mode</Text>
            </View>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>

          <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center gap-3">
              <Feather name="bell" size={20} color="#3b82f6" />
              <Text className="text-base text-gray-800">Notifications</Text>
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
              <Text className="text-base text-gray-800">Chat Wallpaper</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#aaa" />
          </TouchableOpacity>
        </View>
        <View className="border-t border-gray-200 pt-4 mb-6">
          <Text className="text-sm font-medium text-gray-500 mb-2">
            ACCOUNT
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/screens/pages/ProfileEdit")}
            className="flex-row items-center justify-between py-3"
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="call" size={20} color="#3b82f6" />
              <Text className="text-base text-gray-800">
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
              <Text className="text-base text-gray-800">Privacy</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#aaa" />
          </TouchableOpacity>
        </View>
        <View className="border-t border-gray-200 pt-4 mb-6">
          <Text className="text-sm font-medium text-gray-500 mb-2">BACKUP</Text>

          <View className="space-y-3">
            <View>
              <Text className="text-base text-gray-800 mb-1">Backup Email</Text>
            </View>
            <View className="flex gap-4">
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#999"
                className="border border-gray-300 px-4 py-2 rounded-lg text-gray-800"
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
                className="bg-blue-500 py-3 my-0 mx-auto w-52 rounded-full items-center shadow"
              >
                <Text className="text-white font-semibold text-base">
                  {emailSaved ? "Saved ✔" : "Save Email"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        ✔️
        <View className="border-t border-gray-200 pt-4 mb-6">
          <Text className="text-sm font-medium text-gray-500 mb-2">ABOUT</Text>

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
              <Text className="text-base text-gray-800">About App</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#aaa" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("screens/pages/HelpCenter")}
            className="flex-row items-center justify-between py-3"
          >
            <View className="flex-row items-center gap-3">
              <Feather name="help-circle" size={20} color="#3b82f6" />
              <Text className="text-base text-gray-800">Help & Support</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#aaa" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-between py-3"
          >
            <View className="flex-row items-center gap-3">
              <MaterialIcons name="logout" size={20} color="#ef4444" />
              <Text className="text-base text-red-600 font-medium">Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Setting;

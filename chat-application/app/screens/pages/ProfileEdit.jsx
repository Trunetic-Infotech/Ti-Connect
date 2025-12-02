import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome6, FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector } from "react-redux";

const ProfileEdit = () => {
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

  const [name] = useState(user?.name || "Aman Verma");
  const [bio] = useState(user?.bioDescription || "Busy with work");
  const [phone] = useState(user?.phoneNumber || "557993469");
  const [image] = useState(
    user?.image ? { uri: user.image } : require("../../../assets/images/dp.jpg")
  );
  const darkMode = useSelector((state) => state.theme.darkMode);
  const colors = {
    background: darkMode ? "#111111" : "#f3f4f6",
    cardBg: darkMode ? "#1f1f1f" : "#ffffff",
    cardBorder: darkMode ? "#333333" : "#e5e7eb",
    text: darkMode ? "#f5f5f5" : "#1f2937",
    textSecondary: darkMode ? "#bbbbbb" : "#6b7280",
    textMuted: darkMode ? "#888888" : "#9ca3af",
    profileBorder: darkMode ? "#333" : "#fff",
  };


  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header with wave effect */}
      <LinearGradient
        colors={["#6366f1", "#8b5cf6", "#ec4899"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="h-52 rounded-b-[50px] shadow-lg relative"
      >
        {/* Back button */}
        <View className="flex-row items-center justify-between px-5 pt-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 rounded-full bg-white/20 active:opacity-70"
          >
            <FontAwesome6 name="arrow-left-long" size={22} color="white" />
          </TouchableOpacity>

          <Text className="text-white text-xl font-bold">My Profile</Text>
          <View></View>
        </View>
      </LinearGradient>

      {/* Floating profile picture */}
      <View className="items-center -mt-20">
        <View className="relative">
          <Image
            source={image}
            style={{
              width: 140,
              height: 140,
              borderRadius: 70,
              borderWidth: 5,
              borderColor: colors.profileBorder,   // ← now adapts
              shadowColor: "#8b5cf6",
              shadowOpacity: 0.4,
              shadowRadius: 15,
              elevation: 10,
            }}
          />
        </View>
        <Text className="text-xl font-semibold mt-3" style={{ color: colors.text }}>{name}</Text>
        <Text style={{ color: colors.textSecondary }}>
          {user?.isOnline === "active" ? "Online" : "Offline"}
        </Text>
      </View>

      {/* Body */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 px-6 pt-8"
      >
        {/* Glassmorphism Info Card */}
        <View
          className="rounded-3xl p-6 shadow-xl mx-4"
          style={{
            backgroundColor: colors.cardBg,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            shadowColor: "#000",
            shadowOpacity: darkMode ? 0.3 : 0.1,
            shadowRadius: 10,
            elevation: darkMode ? 8 : 5,
          }}
        >
          <View>
            <Text className="font-medium text-sm uppercase mb-1" style={{ color: colors.textMuted }}>
              Phone Number
            </Text>
            <Text className="text-lg font-semibold tracking-wide" style={{ color: colors.text }}>
              +91 {phone}
            </Text>
          </View>

          <View className="border-t pt-5" style={{ borderTopColor: colors.cardBorder }}>
            <Text className="font-medium text-sm uppercase mb-1" style={{ color: colors.textMuted }}>
              About Me
            </Text>
            <Text className="text-base leading-6" style={{ color: colors.textSecondary }}>
              {bio}
            </Text>
          </View>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ProfileEdit;

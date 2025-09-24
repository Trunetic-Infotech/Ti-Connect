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

  

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
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
              borderColor: "#fff",
              shadowColor: "#8b5cf6",
              shadowOpacity: 0.4,
              shadowRadius: 15,
              elevation: 10,
            }}
          />
        </View>
        <Text className="text-xl font-semibold text-gray-800 mt-3">{name}</Text>
        <Text className="text-sm text-gray-500">
          {user?.isOnline === "active" ? "🟢 Online" : "⚫ Offline"}
        </Text>
      </View>

      {/* Body */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 px-6 pt-8"
      >
        {/* Glassmorphism Info Card */}
        <View className="bg-white/80 rounded-3xl p-6 shadow-xl border border-gray-100 space-y-6">
          <View>
            <Text className="text-gray-400 font-medium text-sm uppercase mb-1">
              Phone Number
            </Text>
            <Text className="text-lg font-semibold text-gray-900 tracking-wide">
              +91 {phone}
            </Text>
          </View>

          <View className="border-t border-gray-200 pt-5">
            <Text className="text-gray-400 font-medium text-sm uppercase mb-1">
              About Me
            </Text>
            <Text className="text-base text-gray-700 leading-6">{bio}</Text>
          </View>
        </View>
    
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ProfileEdit;

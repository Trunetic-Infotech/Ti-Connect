import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const AboutAppInformation = () => {
  const router = useRouter();

  const openLink = (url) => {
    Linking.openURL(url).catch(() => {
      alert("Unable to open link");
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-row items-center justify-between px-4 py-5 border-b border-gray-100 bg-white">
        <Text className="text-xl font-bold text-gray-800">
          About App Information
        </Text>
        <Ionicons
          name="close"
          size={24}
          color="#3b82f6"
          onPress={() => router.back()}
        />
      </View>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View className="items-center mb-8">
          <Image
            source={require("../../../assets/images/TI-Connect.png")}
            style={{ width: 80, height: 80, borderRadius: 20 }}
          />
          <Text className="text-2xl font-bold text-gray-800 mt-4">
            TI-Connect
          </Text>
          <Text className="text-sm text-gray-500 mt-1">Version 1.0.0</Text>
        </View>
        <Text className="text-base text-gray-700 leading-relaxed mb-6">
          TI-Connect is a modern messaging app that lets you connect with
          friends and family in real-time. With fast delivery, media sharing,
          group chats, and end-to-end encryption, your conversations are always
          secure and private.
        </Text>
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Developer
          </Text>
          <Text className="text-base text-gray-700">Nouman Ansari</Text>
          <Text
            className="text-base text-blue-600"
            onPress={() => openLink("mailto:developer@example.com")}
          >
            developer@example.com
          </Text>
        </View>
        <View className="mb-10">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Legal
          </Text>

          <TouchableOpacity
            onPress={() => openLink("https://example.com/terms")}
          >
            <Text className="text-base text-blue-600 mb-2">
              Terms of Service
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openLink("https://example.com/privacy")}
          >
            <Text className="text-base text-blue-600">Privacy Policy</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-center text-sm text-gray-400">
          © {new Date().getFullYear()} ChatApp. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutAppInformation;

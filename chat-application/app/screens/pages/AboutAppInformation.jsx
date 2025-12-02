import { View, Text, ScrollView, Image, TouchableOpacity, Linking } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux"; // ← Added

const AboutAppInformation = () => {
  const router = useRouter();

  // ← Get dark mode from Redux
  const darkMode = useSelector((state) => state.theme.darkMode);

  // ← Theme colors — only colors change, layout stays 100% same
  const colors = {
    background: darkMode ? "#111111" : "#ffffff",
    headerBg: darkMode ? "#1a1a1a" : "#ffffff",
    border: darkMode ? "#333333" : "#e5e7eb",
    text: darkMode ? "#f5f5f5" : "#1f2937",
    textSecondary: darkMode ? "#bbbbbb" : "#6b7280",
    textMuted: darkMode ? "#888888" : "#9ca3af",
    link: "#3b82f6", // Blue stays blue
  };

  const openLink = (url) => {
    Linking.openURL(url).catch(() => {
      alert("Unable to open link");
    });
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={["top", "bottom"]}
    >
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 py-5 border-b"
        style={{
          backgroundColor: colors.headerBg,
          borderBottomColor: colors.border,
        }}
      >
        <Text className="text-xl font-bold" style={{ color: colors.text }}>
          About App Information
        </Text>
        <Ionicons
          name="close"
          size={24}
          color="#3b82f6"
          onPress={() => router.back()}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo & Name */}
        <View className="items-center mb-8">
          <Image
            source={require("../../../assets/images/TI-Connect.png")}
            style={{ width: 80, height: 80, borderRadius: 20 }}
          />
          <Text className="text-2xl font-bold mt-4" style={{ color: colors.text }}>
            TI-Connect
          </Text>
          <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            Version 1.0.0
          </Text>
        </View>

        {/* Description */}
        <Text className="text-base leading-relaxed mb-6" style={{ color: colors.textMuted }}>
          TI-Connect is a modern messaging app that lets you connect with
          friends and family in real-time. With fast delivery, media sharing,
          group chats, and end-to-end encryption, your conversations are always
          secure and private.
        </Text>

        {/* Developer */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
            Developer
          </Text>
          <Text className="text-base" style={{ color: colors.textSecondary }}>
            Nouman Ansari
          </Text>
          <Text
            className="text-base"
            style={{ color: colors.link }}
            onPress={() => openLink("mailto:developer@example.com")}
          >
            developer@example.com
          </Text>
        </View>

        {/* Legal Links */}
        <View className="mb-10">
          <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
            Legal
          </Text>

          <TouchableOpacity onPress={() => openLink("https://example.com/terms")}>
            <Text className="text-base mb-2" style={{ color: colors.link }}>
              Terms of Service
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => openLink("https://example.com/privacy")}>
            <Text className="text-base" style={{ color: colors.link }}>
              Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text className="text-center text-sm" style={{ color: colors.textMuted }}>
          © {new Date().getFullYear()} TI-Connect. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutAppInformation;
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux"; // ← Added

const HelpCenter = () => {
  const router = useRouter();

  // ← Get dark mode from Redux
  const darkMode = useSelector((state) => state.theme.darkMode);

  // ← Theme colors — only colors change, layout 100% same
  const colors = {
    background: darkMode ? "#111111" : "#ffffff",
    text: darkMode ? "#f5f5f5" : "#1f2937",
    textSecondary: darkMode ? "#bbbbbb" : "#6b7280",
    textMuted: darkMode ? "#888888" : "#6b7280",
    cardBg: darkMode ? "#1f1f1f" : "#f3f4f6",
    supportBg: darkMode ? "#1e3a8a" : "#dbeafe", // dark blue-900 / light blue-100
    supportText: darkMode ? "#93c5fd" : "#1d4ed8",
    feedbackBg: darkMode ? "#166534" : "#d1fae5", // dark green-900 / light green-100
    feedbackText: darkMode ? "#86efac" : "#16a34a",
  };

  const openEmail = () => {
    Linking.openURL("mailto:support@truneticinfotech.com").catch(() =>
      Alert.alert("Error", "Could not open email client.")
    );
  };

  const handleFeedback = () => {
    Alert.alert("Feedback", "Thank you! Feature coming soon.");
  };

  return (
    <SafeAreaView
      className="flex-1 px-4"
      style={{ backgroundColor: colors.background }}
      edges={["top", "bottom"]}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between py-5">
        <Text className="text-xl font-bold" style={{ color: colors.text }}>
          Help & Support
        </Text>
        <Ionicons
          name="close"
          size={24}
          color="#3b82f6"
          onPress={() => router.back()}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* FAQ Section */}
        <Text className="text-lg font-semibold mt-4 mb-2" style={{ color: colors.text }}>
          Frequently Asked Questions
        </Text>

        <View className="space-y-4 mb-6">
          <View className="p-4 rounded-lg" style={{ backgroundColor: colors.cardBg }}>
            <Text className="font-medium" style={{ color: colors.text }}>
              How do I reset my password?
            </Text>
            <Text className="text-sm mt-1" style={{ color: colors.textMuted }}>
              Go to Settings → Account → Change Password.
            </Text>
          </View>

          <View className="p-4 rounded-lg" style={{ backgroundColor: colors.cardBg }}>
            <Text className="font-medium" style={{ color: colors.text }}>
              How do I delete my account?
            </Text>
            <Text className="text-sm mt-1" style={{ color: colors.textMuted }}>
              Contact support to initiate account deletion.
            </Text>
          </View>

          <View className="p-4 rounded-lg" style={{ backgroundColor: colors.cardBg }}>
            <Text className="font-medium" style={{ color: colors.text }}>
              Is my chat data encrypted?
            </Text>
            <Text className="text-sm mt-1" style={{ color: colors.textMuted }}>
              Yes, all messages are end-to-end encrypted.
            </Text>
          </View>
        </View>

        {/* Support Section */}
        <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
          Need more help?
        </Text>

        {/* Contact Support */}
        <TouchableOpacity
          onPress={openEmail}
          className="flex-row items-center justify-between px-4 py-4 rounded-lg mb-4"
          style={{ backgroundColor: colors.supportBg }}
        >
          <View>
            <Text className="font-medium" style={{ color: colors.supportText }}>
              Contact Support
            </Text>
            <Text className="text-sm" style={{ color: colors.supportText }}>
              support@chatapp.com
            </Text>
          </View>
          <Feather name="mail" size={22} color={colors.supportText} />
        </TouchableOpacity>

        {/* Send Feedback */}
        <TouchableOpacity
          onPress={handleFeedback}
          className="flex-row items-center justify-between px-4 py-4 rounded-lg"
          style={{ backgroundColor: colors.feedbackBg }}
        >
          <View>
            <Text className="font-medium" style={{ color: colors.feedbackText }}>
              Send Feedback
            </Text>
            <Text className="text-sm" style={{ color: colors.feedbackText }}>
              We'd love to hear from you
            </Text>
          </View>
          <Feather name="message-circle" size={22} color={colors.feedbackText} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpCenter;
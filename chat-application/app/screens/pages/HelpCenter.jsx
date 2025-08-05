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

const HelpCenter = () => {
  const router = useRouter();

  const openEmail = () => {
    Linking.openURL("mailto:support@truneticinfotech.com").catch(() =>
      Alert.alert("Error", "Could not open email client.")
    );
  };

  const handleFeedback = () => {
    Alert.alert("Feedback", "Thank you! Feature coming soon.");
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-4" edges={["top", "bottom"]}>
      <View className="flex-row items-center justify-between py-5">
        <Text className="text-xl font-bold text-gray-800">Help & Support</Text>
        <Ionicons
          name="close"
          size={24}
          color="#3b82f6"
          onPress={() => router.back()}
        />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-lg font-semibold text-gray-800 mt-4 mb-2">
          Frequently Asked Questions
        </Text>
        <View className="space-y-4 mb-6">
          <View className="bg-gray-100 p-4 rounded-lg">
            <Text className="font-medium text-gray-700">
              How do I reset my password?
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              Go to Settings {"->"} Account {"->"} Change Password.
            </Text>
          </View>
          <View className="bg-gray-100 p-4 rounded-lg">
            <Text className="font-medium text-gray-700">
              How do I delete my account?
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              Contact support to initiate account deletion.
            </Text>
          </View>
          <View className="bg-gray-100 p-4 rounded-lg">
            <Text className="font-medium text-gray-700">
              Is my chat data encrypted?
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              Yes, all messages are end-to-end encrypted.
            </Text>
          </View>
        </View>
        <Text className="text-lg font-semibold text-gray-800 mb-3">
          Need more help?
        </Text>
        <TouchableOpacity
          onPress={openEmail}
          className="flex-row items-center justify-between px-4 py-4 bg-blue-100 rounded-lg mb-4"
        >
          <View>
            <Text className="font-medium text-blue-700">Contact Support</Text>
            <Text className="text-sm text-blue-600">support@chatapp.com</Text>
          </View>
          <Feather name="mail" size={22} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleFeedback}
          className="flex-row items-center justify-between px-4 py-4 bg-green-100 rounded-lg"
        >
          <View>
            <Text className="font-medium text-green-700">Send Feedback</Text>
            <Text className="text-sm text-green-600">
              We'd love to hear from you
            </Text>
          </View>
          <Feather name="message-circle" size={22} color="#10b981" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpCenter;

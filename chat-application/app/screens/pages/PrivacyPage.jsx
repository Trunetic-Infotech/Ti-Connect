import { View, Text, FlatList, Switch, Alert } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";

const options = ["Everyone", "My Contacts", "Nobody"];

const PrivacyPage = () => {
  const router = useRouter();

  // ← Get dark mode from Redux
  const darkMode = useSelector((state) => state.theme.darkMode);

  const [lastseen, setLastseen] = useState("My Contacts");
  const [profilePhoto, setProfilePhoto] = useState("Everyone");
  const [readReceipts, setReadReceipts] = useState(true);

  // ← Theme colors (only colors change — layout stays 100% same)
  const colors = {
    background: darkMode ? "#111111" : "#ffffff",
    text: darkMode ? "#f5f5f5" : "#1f2937",
    textSecondary: darkMode ? "#bbbbbb" : "#6b7280",
    cardBg: darkMode ? "#1f1f1f" : "#f3f4f6",
    blockedBg: darkMode ? "#2d1b1b" : "#fef2f2",
    blockedText: darkMode ? "#fca5a5" : "#dc2626",
  };

  const handleBlockedContacts = () => {
    router.push("/screens/pages/BlockedContacts");
  };

  const renderPicker = (title, selectedOption, setSelected) => (
    <View className="mb-6">
      <Text className="text-base font-semibold mb-2" style={{ color: colors.text }}>
        {title}
      </Text>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => setSelected(option)}
          className="flex-row items-center justify-between py-3 px-4 rounded-lg mb-2"
          style={{ backgroundColor: colors.cardBg }}
        >
          <Text style={{ color: colors.text }} className="text-base">
            {option}
          </Text>
          {selectedOption === option && (
            <Feather name="check" size={20} color="#3b82f6" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1 px-4 pt-6"
      style={{ backgroundColor: colors.background }}
      edges={["top", "bottom"]}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>
          Privacy
        </Text>
        <Ionicons
          name="close"
          size={24}
          color="#3b82f6"
          onPress={() => router.back()}
        />
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {renderPicker("Last Seen", lastseen, setLastseen)}
            {renderPicker("Profile Photo", profilePhoto, setProfilePhoto)}

            {/* Read Receipts */}
            <View
              className="flex-row items-center justify-between py-3 px-4 rounded-lg mb-6"
              style={{ backgroundColor: colors.cardBg }}
            >
              <View>
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                  Read Receipts
                </Text>
                <Text className="text-sm max-w-xs" style={{ color: colors.textSecondary }}>
                  If turned off, you won't send or receive read receipts. Group chats still show them.
                </Text>
              </View>
              <Switch value={readReceipts} onValueChange={setReadReceipts} />
            </View>

            {/* Blocked Contacts */}
            <TouchableOpacity
              onPress={handleBlockedContacts}
              className="flex-row items-center justify-between py-4 px-4 rounded-lg"
              style={{ backgroundColor: colors.blockedBg }}
            >
              <View>
                <Text className="text-base font-semibold" style={{ color: colors.blockedText }}>
                  Blocked Contacts
                </Text>
                <Text className="text-sm" style={{ color: colors.blockedText }}>
                  Manage blocked users
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.blockedText} />
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default PrivacyPage;
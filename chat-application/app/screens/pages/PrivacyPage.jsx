import { View, Text, FlatList, Switch, Alert } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

const options = ["Everyone", "My Contacts", "Nobody"];

const PrivacyPage = () => {
  const router = useRouter();
  const [lastseen, setLastseen] = useState("My Contacts");
  const [profilePhoto, setProfilePhoto] = useState("Everyone");
  const [readReceipts, setReadReceipts] = useState(true);

  const handleBlockedContacts = () => {
    // Alert.alert("Blocked Contacts", "You have 2 blocked contacts.");
    router.push("/screens/pages/BlockedContacts");
  };

  const renderPicker = (title, selectedOpttion, setSelected) => (
    <View className="mb-6">
      <Text className="text-base font-semibold text-gray-800 mb-2">
        {title}
      </Text>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => setSelected(option)}
          className="flex-row items-center justify-between py-3 px-4 bg-gray-100 rounded-lg mb-2"
        >
          <Text className="text-gray-700 text-base">{option}</Text>
          {selectedOpttion === option && (
            <Feather name="check" size={20} color="#3b82f6" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1 bg-white px-4 pt-6"
      edges={["top", "bottom"]}
    >
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-2xl font-bold text-gray-800">Privacy</Text>
        <Ionicons
          name="close"
          size={24}
          color="#3b82f6"
          onPress={() => router.back()}
        />
      </View>
      <FlatList
        ListHeaderComponent={
          <View>
            {renderPicker("Last Seen", lastseen, setLastseen)}
            {renderPicker("Profile Photo", profilePhoto, setProfilePhoto)}
            <View className="flex-row items-center justify-between py-3 px-4 bg-gray-100 rounded-lg mb-6">
              <View>
                <Text className="text-base font-semibold text-gray-800">
                  Read Receipts
                </Text>
                <Text className="text-sm text-gray-500 max-w-xs">
                  If turned off, you won't send or receive read receipts. Group
                  chats still show them.
                </Text>
              </View>
              <Switch value={readReceipts} onValueChange={setReadReceipts} />
            </View>
            <TouchableOpacity
              onPress={handleBlockedContacts}
              className="flex-row items-center justify-between py-4 px-4 bg-red-50 rounded-lg"
            >
              <View>
                <Text className="text-base font-semibold text-red-600">
                  Blocked Contacts
                </Text>
                <Text className="text-sm text-red-400">
                  Manage blocked users
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default PrivacyPage;

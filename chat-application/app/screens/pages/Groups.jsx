import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import logoImg from "../../../assets/images/Chat-Logo.png";

const initialGroups = [
  {
    id: 1,
    name: "Friends Group",
    text: "Let's plan something for weekend.",
    time: "10:15 AM",
    unread: true,
  },
  {
    id: 2,
    name: "Family Members",
    text: "Dinner at 8 PM!",
    time: "Yesterday",
    unread: false,
  },
  {
    id: 3,
    name: "Office Team",
    text: "Project deadline extended.",
    time: "Monday",
    unread: true,
  },
];

const Groups = () => {
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("Groups");
  const [groups, setGroups] = useState(initialGroups);
  const navigation = useNavigation();
  const router = useRouter();

  // 🔍 Filtered groups
  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(search.toLowerCase()) ||
      group.text.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ delete group
  const handleDeleteGroup = (id) => {
    setGroups((prev) => prev.filter((group) => group.id !== id));
  };

  const confirmDelete = (id) => {
    Alert.alert("Delete Group", "Are you sure you want to delete this group?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDeleteGroup(id),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f1f5f9]">
      {/* Header */}
      <View className="px-5 pt-6 pb-3 bg-indigo-600 rounded-b-3xl">
        <Image
          source={logoImg}
          style={{ width: 200, height: 46, alignSelf: "center" }}
        />

        <View className="flex-row items-center bg-white rounded-full px-5 py-0 shadow-sm mt-3">
          <Feather name="search" size={20} color="#555" />
          <TextInput
            placeholder="Search groups..."
            className="ml-3 flex-1 text-base text-gray-800"
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row justify-between mx-4 mt-5 mb-4">
        {[
          { title: "All", screen: "Chats", type: "navigate" },
          { title: "Unread", screen: "UnRead", type: "navigate" },
          { title: "Groups", type: "filter" }, // local filter tab
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              if (item.type === "filter") {
                setSelectedTab("Groups"); // stay on Groups
              } else {
                navigation.navigate(item.screen); // go to Chats or UnRead
              }
            }}
            className={`flex-1 mx-1 py-2 rounded-full ${
              selectedTab === item.title ? "bg-indigo-600" : "bg-indigo-300"
            }`}
            activeOpacity={0.9}
          >
            <Text className="text-center text-white font-semibold">
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Groups List */}
      {selectedTab === "Groups" && (
        <ScrollView
          className="px-4"
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View className="space-y-4 gap-3">
            {filteredGroups.map((group) => (
              <TouchableOpacity
                key={group.id}
                onPress={() => router.push("/screens/pages/GroupMessage")}
                onLongPress={() => confirmDelete(group.id)}
                delayLongPress={400}
                activeOpacity={0.9}
                className="flex-row justify-between items-center bg-indigo-100 px-4 py-4 rounded-2xl shadow-sm border border-gray-200"
              >
                <View className="flex-row items-center gap-4">
                  <FontAwesome5 name="users" size={44} color="#6366f1" />
                  <View>
                    <Text className="text-lg font-semibold text-gray-800">
                      {group.name}
                    </Text>
                    <Text className="text-sm text-gray-500">{group.text}</Text>
                  </View>
                </View>
                <Text className="text-xs text-gray-400">{group.time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Floating Button */}
      <TouchableOpacity
        onPress={() => router.push("/screens/pages/CreateGroup")}
        className="absolute bottom-24 right-5 bg-indigo-600 p-3 rounded-full shadow-lg"
      >
        <Feather name="user-plus" size={26} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Groups;

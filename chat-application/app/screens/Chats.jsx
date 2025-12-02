import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import logoImg from "../../assets/images/Chat-Logo.png";
import { useRouter } from "expo-router";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setOnlineUsers } from "../redux/features/auth";
import * as SecureStore from "expo-secure-store";

const Chats = () => {
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("All");
  const [chatsList, setChatsList] = useState([]);
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  const navigation = useNavigation();
  const router = useRouter();
  const dispatch = useDispatch();

  const { users, isUserLoading } = useSelector((state) => state.messages);
  const onlineUsers = useSelector((state) => state.auth.onlineUsers);

  // Get dark mode from Redux
  const darkMode = useSelector((state) => state.theme.darkMode);

  // Theme colors — only colors change, layout stays perfect
  const colors = {
    background: darkMode ? "#111111" : "#f1f5f9",
    headerBg: darkMode ? "#1e1b4b" : "#6366f1", // indigo-600 → darker indigo
    cardBg: darkMode ? "#1f1f1f" : "#ffffff",
    cardBorder: darkMode ? "#333333" : "#e5e7eb",
    text: darkMode ? "#f5f5f5" : "#1f2937",
    textSecondary: darkMode ? "#bbbbbb" : "#6b7280",
    searchBg: darkMode ? "#2a2a2a" : "#ffffff",
    tabActive: darkMode ? "#4f46e5" : "#6366f1",
    tabInactive: darkMode ? "#374151" : "#a5b4fc",
    placeholder: darkMode ? "#888888" : "#999999",
  };

  const fetchChatList = async () => {
    const token = await SecureStore.getItemAsync("token");
    try {
      const response = await axios.get(
        `${process.env.EXPO_API_URL}/list/online`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.success) {
        const mappedChats = response.data.data.users.map((user) => ({
          id: user.id,
          phoneNumber: user.phone_number,
          name: user.username,
          image: user.profile_picture ?? "",
          text: user.lastMessage ?? "",
          isOnline: user.status ?? "",
          lastSeen: user.last_seen_at ?? "none",
        }));
        setChatsList(mappedChats);
        dispatch(setOnlineUsers(response.data.data.users));
      }
    } catch (error) {
      console.log("Error fetching user list:", error);
    }
  };

  useEffect(() => {
    fetchChatList();
  }, []);

  const filteredChats = chatsList.filter((chat) => {
    const matchesSearch = chat.name?.toLowerCase().includes(search.toLowerCase()) ||
      chat.text?.toLowerCase().includes(search.toLowerCase());

    if (showOnlineOnly) {
      return matchesSearch && chat.isOnline;
    }
    return matchesSearch;
  });

  if (isUserLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Text className="text-center mt-10" style={{ color: colors.text }}>
          Loading chats...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View
        className="px-5 pt-6 pb-4 rounded-b-3xl"
        style={{ backgroundColor: colors.headerBg }}
      >
        <Image
          source={logoImg}
          style={{ width: 200, height: 46, alignSelf: "center" }}
        />

        <View
          className="flex-row items-center rounded-full px-5 mt-4 shadow-lg"
          style={{ backgroundColor: colors.searchBg }}
        >
          <Feather name="search" size={20} color={colors.textSecondary} />
          <TextInput
            placeholder="Search chats..."
            placeholderTextColor={colors.placeholder}
            className="ml-3 flex-1 py-3 text-base"
            style={{ color: colors.text }}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row justify-between mx-4 mt-5 mb-4">
        {[
          { title: "All", type: "filter" },
          { title: "Groups", screen: "Groups", type: "navigate" },
        ].map((item) => (
          <TouchableOpacity
            key={item.title}
            onPress={() => {
              if (item.type === "filter") setSelectedTab(item.title);
              else navigation.navigate(item.screen);
            }}
            style={{
              backgroundColor:
                selectedTab === item.title ? colors.tabActive : colors.tabInactive,
            }}
            className="flex-1 mx-1 py-3 rounded-full"
          >
            <Text className="text-center text-white font-semibold">
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chat List */}
      {selectedTab === "All" && (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="space-y-4">
            {filteredChats.length === 0 ? (
              <View className="items-center mt-10">
                <Text style={{ color: colors.textSecondary }} className="text-lg">
                  No chats found
                </Text>
                {search && (
                  <Text style={{ color: colors.textMuted }} className="mt-2">
                    for "{search}"
                  </Text>
                )}
              </View>
            ) : (
              filteredChats.map((chat) => (
                <TouchableOpacity
                  key={chat.id}
                  onPress={() =>
                    router.push({
                      pathname: "/screens/Message",
                      params: { user: JSON.stringify(chat) },
                    })
                  }
                  activeOpacity={0.8}
                  className="flex-row items-center px-4 py-4 rounded-2xl shadow-sm"
                  style={{
                    backgroundColor: colors.cardBg,
                    borderWidth: 1,
                    borderColor: colors.cardBorder,
                  }}
                >
                  <View className="relative">
                    {chat.image ? (
                      <Image
                        source={{ uri: chat.image }}
                        style={{ width: 52, height: 52, borderRadius: 26 }}
                      />
                    ) : (
                      <FontAwesome5 name="user-circle" size={52} color="#6366f1" />
                    )}
                    {chat.isOnline && (
                      <View
                        className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"
                        style={{ borderColor: colors.cardBg }}
                      />
                    )}
                  </View>

                  <View className="flex-1 ml-4">
                    <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                      {chat.name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      className="text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      {chat.text || "No messages yet"}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* Floating Add Contact Button */}
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/screens/pages/AddContact",
            params: { type: "single" },
          })
        }
        className="absolute bottom-24 right-5 p-4 rounded-full shadow-2xl"
        style={{ backgroundColor: colors.tabActive }}
      >
        <Feather name="user-plus" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Chats;
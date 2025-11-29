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
  const navigation = useNavigation();
  const router = useRouter();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);


  const dispatch = useDispatch();

  const { users, isUserLoading } = useSelector(
    (state) => state.messages
  );
  const onlineUsers = useSelector((state) => state.auth.onlineUsers);
  // Fetch chat list
  const fetchChatList = async () => {
    const token = await SecureStore.getItemAsync("token");
    try {
      const response = await axios.get(
        `${process.env.EXPO_API_URL}/list/online`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // console.log("Online users:", response);

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

  if (isUserLoading) return <Text>Loading...</Text>;

  const filteredChats = chatsList.filter((chat) => {
    const name = chat.name?.toLowerCase() || "";
    const text = chat.text?.toLowerCase() || "";

    const matchesSearch =
      name.includes(search.toLowerCase()) ||
      text.includes(search.toLowerCase());

    if (showOnlineOnly) {
      const onlineUserIds = onlineUsers.map((u) => u.id);
      return matchesSearch && onlineUserIds
        ? users.filter((user) => onlineUserIds.includes(user.id))
        : users;
    }

    return matchesSearch;
  });

  useEffect(() => {
    fetchChatList();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#f1f5f9]">
      {/* Header */}
      <View className="px-5 pt-6 pb-3 bg-indigo-600 rounded-b-3xl">
        <Image
          source={logoImg}
          style={{ width: 200, height: 46, alignSelf: "center" }}
        />

        <View className="flex-row items-center bg-white rounded-full px-5 shadow-sm mt-3">
          <Feather name="search" size={20} color="#555" />
          <TextInput
            placeholder="Search chats..."
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
          { title: "All", type: "filter" },
          // { title: "Unread", screen: "UnRead", type: "navigate" },
          { title: "Groups", screen: "Groups", type: "navigate" },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              if (item.type === "filter") {
                setSelectedTab("All");
              } else {
                navigation.navigate(item.screen);
              }
            }}
            className={`flex-1 mx-1 py-2 rounded-full ${selectedTab === item.title ? "bg-indigo-600" : "bg-indigo-300"
              }`}
            activeOpacity={0.9}
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
          className="px-4"
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View className="space-y-4 gap-3">
            {filteredChats.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                onPress={() =>
                  router.push({
                    pathname: "/screens/Message",
                    params: { user: JSON.stringify(chat) },
                    type: "single",
                  })
                }
                activeOpacity={0.9}
                className="flex-row justify-between items-center bg-white px-4 py-4 rounded-2xl shadow-sm border border-gray-200"
              >

                <View className="flex-row items-center gap-4">
                  {chat.image ? (
                    <View>
                      <Image
                        source={{ uri: chat.image }}
                        style={{ width: 44, height: 44, borderRadius: 22 }}
                      />
                      <View
                        className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${chat.status === "active" ? "bg-green-500" : "bg-gray-500"
                          }`}
                      />
                    </View>

                  ) : (
                    <FontAwesome5
                      name="user-circle"
                      size={44}
                      color="#6366f1"
                    />
                  )}
                  <View>
                    <Text className="text-lg font-semibold text-gray-800">
                      {chat.name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{ flexWrap: "wrap", maxWidth: 200 }}
                    >
                      {chat.text}
                    </Text>
                  </View>
                </View>
                {/* Optionally add time if available */}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Add Contact Floating Button */}
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/screens/pages/AddContact",
            params: { type: "single" },
          })
        }

        className="absolute bottom-24 right-5 bg-indigo-600 p-3 rounded-full shadow-lg"
      >
        <Feather name="user-plus" size={26} color="#fff" />
      </TouchableOpacity>

      {filteredChats.length === 0 && (
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-semibold text-gray-500">
            No Chats Found for "{search}"
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Chats;

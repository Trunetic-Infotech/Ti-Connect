import React, { useState,useEffect } from "react";
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

const Chats = () => {
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("All");
  const navigation = useNavigation();
  const router = useRouter();
  const [chatsList, setChatsList] = useState([]);
 const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const fetchChatList = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_API_URL}/list/online/${user.phone_number}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);

      if (response.data?.success) {
        const mappedChats = response.data.data.users.map((u) => ({
          id: u.id,
          name: u.username ?? "Unknown",
          image: u.profile_picture ?? "",
          text: u.lastMessage ?? "",
          time: u.lastMessageTime ?? "",
        }));
        setChatsList(mappedChats);
        dispatch(setOnlineUsers(response.data.data.users));
      }
    } catch (error) {
      console.log("Error fetching user list:", error);
    }
  }; // <-- fixed closing brace

  // Filter for All tab
  const filteredChats = chatsList.filter((chat) => {
    const matchesSearch =
      chat.name.toLowerCase().includes(search.toLowerCase()) ||
      chat.text.toLowerCase().includes(search.toLowerCase());
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
          { title: "Unread", screen: "UnRead", type: "navigate" },
          { title: "Groups", screen: "Groups", type: "navigate" },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              if (item.type === "filter") {
                setSelectedTab("All"); // local filter tab
              } else {
                navigation.navigate(item.screen); // navigate to page
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

      {/* Chat List (only for All tab) */}
      {/* {selectedTab === "All" && (
        <ScrollView
          className="px-4"
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View className="space-y-4 gap-3">
            {filteredChats.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                onPress={() => router.push("/screens/Message")}
                activeOpacity={0.9}
                className="flex-row justify-between items-center bg-white px-4 py-4 rounded-2xl shadow-sm border border-gray-200"
              >
                <View className="flex-row items-center gap-4">
                  <FontAwesome5 name="user-circle" size={44} color="#6366f1" />
                  <View>
                    <Text className="text-lg font-semibold text-gray-800">
                      {chat.name}
                    </Text>
                    <Text className="text-sm text-gray-500">{chat.text}</Text>
                  </View>
                </View>
                <Text className="text-xs text-gray-400">{chat.time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )} */}
      {selectedTab === "All" && (
        <ScrollView
          className="px-4"
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View className="space-y-4 gap-3">
            {filteredChats.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                onPress={() => router.push("/screens/Message")}
                activeOpacity={0.9}
                className="flex-row justify-between items-center bg-white px-4 py-4 rounded-2xl shadow-sm border border-gray-200"
              >
                <View className="flex-row items-center gap-4">
                  <FontAwesome5 name="user-circle" size={44} color="#6366f1" />
                  <View>
                    <Text className="text-lg font-semibold text-gray-800">
                      {chat.name}
                    </Text>
                    <Text className="text-sm text-gray-500">{chat.text}</Text>
                  </View>
                </View>
                <Text className="text-xs text-gray-400">{chat.time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
      {/* Add Contact Floating Button */}
      <TouchableOpacity
        onPress={() => router.push("/screens/pages/AddContact")}
        className="absolute bottom-11 right-5 bg-indigo-600 p-3 rounded-full shadow-lg"
      >
        <Feather name="user-plus" size={26} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Chats;
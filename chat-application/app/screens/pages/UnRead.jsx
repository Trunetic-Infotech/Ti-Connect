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

const UnRead = () => {
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState([]); // empty initially (no dummy data)
  const navigation = useNavigation();
  const router = useRouter();

  // Filter unread chats dynamically
  const filteredChats = chats.filter(
    (chat) =>
      chat.unread > 0 &&
      (chat.name?.toLowerCase().includes(search.toLowerCase()) ||
        chat.text?.toLowerCase().includes(search.toLowerCase()))
  );

  // delete chat function
  const handleDeleteChat = (id) => {
    setChats((prev) => prev.filter((chat) => chat.id !== id));
  };

  const confirmDelete = (id) => {
    Alert.alert("Delete Chat", "Are you sure you want to delete this chat?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDeleteChat(id),
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
          { title: "All", screen: "Chats" },
          { title: "Unread", screen: "UnRead" },
          { title: "Groups", screen: "Groups" },
        ].map((item) => (
          <TouchableOpacity
            key={item.title}
            onPress={() => {
              if (item.screen === "UnRead") return; // stay here
              navigation.navigate(item.screen);
            }}
            className={`flex-1 mx-1 py-2 rounded-full ${item.title === "Unread" ? "bg-indigo-600" : "bg-indigo-300"
              }`}
            activeOpacity={0.9}
          >
            <Text className="text-center text-white font-semibold">
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Unread Chats List */}
      <ScrollView
        className="px-4"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="space-y-4 gap-3">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                onPress={() => router.push("/screens/Message")}
                onLongPress={() => confirmDelete(chat.id)}
                delayLongPress={400}
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
                <View className="items-center">
                  <Text className="text-xs text-gray-400">{chat.time}</Text>
                  {chat.unread > 0 && (
                    <Text className="text-xs text-blue-900 text-center px-2 py-1 rounded-full bg-blue-100 mt-1">
                      {chat.unread}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text className="text-center text-gray-500 mt-10">
              No unread chats available.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UnRead;

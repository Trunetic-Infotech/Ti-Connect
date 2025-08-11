import React, { useState } from "react";
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
import { useRouter } from "expo-router";
import logoImg from "../../../assets/images/Chat-Logo.png";

const chatList = [
  {
    id: 1,
    name: "Friends Group",
    text: "Let's plan something for weekend.",
    time: "10:15 AM",
    unRead: "2",
  },
  {
    id: 2,
    name: "Family Members",
    text: "Dinner at 8 PM!",
    time: "Yesterday",
    unRead: "1",
  },
];

const Groups = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredGroups = chatList.filter(
    (group) =>
      group.name.toLowerCase().includes(search.toLowerCase()) ||
      group.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-[#f1f5f9]">
      <View className="px-5 pt-6 pb-3 bg-indigo-600 rounded-b-3xl">
        <Text className="text-4xl font-extrabold text-white text-center tracking-wide mb-3">
          <Image
            source={logoImg}
            style={{
              width: 200,
              height: 46,
              alignSelf: "center",
            }}
          />
        </Text>

        <View className="flex-row items-center bg-white rounded-full px-5 py-0 shadow-sm">
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

      <View className="flex-row justify-between mx-4 mt-5 mb-4">
        {[
          { title: "All", path: "/screens/Chats" },
          { title: "Unread", path: "/screens/pages/UnRead" },
          { title: "Groups", path: "/screens/pages/Groups" },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => router.push(item.path)}
            className="flex-1 mx-1 bg-indigo-500 py-2 rounded-full"
            activeOpacity={0.9}
          >
            <Text className="text-center text-white font-semibold">
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        className="px-4"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="space-y-4 gap-2">
          {filteredGroups.map((group) => (
            <TouchableOpacity
              key={group.id}
              onPress={() => router.push("/screens/pages/GroupMessage")}
              activeOpacity={0.9}
              className="flex-row justify-between items-center bg-indigo-100 px-4 py-4 rounded-2xl shadow-sm border border-gray-200"
            >
              <View className="flex-row items-center gap-2 space-x-4">
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

      <TouchableOpacity
        onPress={() => router.push("/screens/pages/CreateGroup")}
        className="absolute bottom-11 right-5 bg-indigo-600 p-3 rounded-full shadow-lg"
      >
        <FontAwesome5 name="plus" size={26} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Groups;

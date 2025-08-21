import React from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";

const chatList = [
  {
    id: 1,
    name: "Aman Verma",
    text: "I am good, what about you?",
    time: "10:00 AM",
    unRead: 1,
  },
  {
    id: 2,
    name: "John Doe",
    text: "Let's connect later today.",
    time: "9:45 AM",
    unRead: 4,
  },
];

const UnRead = () => {
  const navigation = useNavigation();
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#e0f2fe", "#f8fafc"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <LinearGradient
          colors={["#4f46e5", "#6366f1", "#818cf8"]}
          className="px-6 py-6 rounded-b-3xl shadow-lg"
        >
          <Text className="text-4xl font-extrabold text-white tracking-wide drop-shadow-lg">
            💬 TI-Connect
          </Text>
        </LinearGradient>

        <ScrollView
          className="px-5 pt-6"
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View className="flex-row items-center bg-white/80 border border-gray-200 rounded-full px-5 py-3 shadow-md mb-6 backdrop-blur-sm">
            <Feather name="search" size={20} color="#555" />
            <TextInput
              placeholder="Search chats..."
              className="ml-3 flex-1 text-base text-gray-800"
              placeholderTextColor="#999"
            />
          </View>

          <View className="flex-row justify-between mx-4 mt-5 mb-4">
                 {[
                   { title: "All", path: "../Chats" },
                   { title: "Unread", path: "../pages/UnRead" },
                   { title: "Groups", path: "../pages/Groups" },
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

          {chatList.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              onPress={() => router.push("/screens/Message")}
              activeOpacity={0.9}
              className="flex-row justify-between items-center bg-white px-4 py-4 mb-4 rounded-2xl shadow-lg border border-gray-100"
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
                {chat.unRead > 0 && (
                  <Text className="text-xs text-blue-900 text-center px-2 py-1 rounded-full bg-blue-100 mt-1">
                    {chat.unRead}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default UnRead;

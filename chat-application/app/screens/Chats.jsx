import React from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

const chatList = [
  {
    id: 1,
    name: "Aman Verma",
    text: "I am good, what about you?",
    time: "10:00 AM",
  },
  {
    id: 2,
    name: "John Doe",
    text: "Let's connect later today.",
    time: "9:45 AM",
  },
  {
    id: 3,
    name: "Priya Sharma",
    text: "Meeting rescheduled.",
    time: "Yesterday",
  },
  {
    id: 4,
    name: "Aman Verma",
    text: "I am good, what about you?",
    time: "10:00 AM",
  },
  {
    id: 5,
    name: "John Doe",
    text: "Let's connect later today.",
    time: "9:45 AM",
  },
  {
    id: 6,
    name: "Priya Sharma",
    text: "Meeting rescheduled.",
    time: "Yesterday",
  },
];

const Chats = () => {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#e0f2fe", "#f8fafc"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <SafeAreaView className="flex-1 relative">
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

          <View className="flex-row justify-between mb-6">
            <LinearGradient
              colors={["#6366f1", "#60a5fa"]}
              className="flex-1 mx-1 rounded-full"
            >
              <TouchableOpacity
                onPress={() => "./Chats"}
                activeOpacity={0.9}
                className="py-2 rounded-full"
              >
                <Text className="text-center text-white font-semibold">
                  All
                </Text>
              </TouchableOpacity>
            </LinearGradient>

            <LinearGradient
              colors={["#6366f1", "#60a5fa"]}
              className="flex-1 mx-1 rounded-full"
            >
              <TouchableOpacity
                onPress={() => router.push("/screens/pages/UnRead")}
                activeOpacity={0.9}
                className="py-2 rounded-full"
              >
                <Text className="text-center text-white font-semibold">
                  Unread
                </Text>
              </TouchableOpacity>
            </LinearGradient>

            <LinearGradient
              colors={["#6366f1", "#60a5fa"]}
              className="flex-1 mx-1 rounded-full"
            >
              <TouchableOpacity
                onPress={() => router.push("/screens/pages/Groups")}
                activeOpacity={0.9}
                className="py-2 rounded-full"
              >
                <Text className="text-center text-white font-semibold">
                  Groups
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {chatList.map((chat) => (
            <TouchableOpacity
              onPress={() => {
                router.push("/screens/Message");
              }}
              key={chat.id}
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
              <Text className="text-xs text-gray-400">{chat.time}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View className="absolute bottom-40 right-5">
          <FontAwesome5
            onPress={() => router.push("/screens/pages/AddContact")}
            name="plus-square"
            size={44}
            color="#6366f1"
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Chats;

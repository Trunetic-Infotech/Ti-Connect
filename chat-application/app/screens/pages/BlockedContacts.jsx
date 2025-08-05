import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  FlatList,
  Image,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const initialBlockedUsers = [
  {
    id: "1",
    name: "Rahul Sharma",
    img: require("../../../assets/images/dp.jpg"),
  },
  {
    id: "2",
    name: "Priya Patel",
    img: require("../../../assets/images/dp.jpg"),
  },
  {
    id: "3",
    name: "Priyanka Chopra",
    img: require("../../../assets/images/dp.jpg"),
  },
  {
    id: "4",
    name: "Nouman Ansari",
    img: require("../../../assets/images/dp.jpg"),
  },
];

const BlockedContacts = () => {
  const router = useRouter();
  const [blockedUsers, setBlockedUsers] = useState(initialBlockedUsers);

  const handleUnblock = (id, name) => {
    Alert.alert(
      "Unblock Contact",
      `Are you sure you want to unblock ${name}?`,
      [
        { text: "cancel", style: "cancel" },
        {
          text: "Unblock",
          style: "destructive",
          onPress: () => {
            setBlockedUsers((prev) => prev.filter((user) => user.id !== id));
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
      <View className="flex-row items-center gap-3">
        <Image
          source={item.img}
          style={{ width: 48, height: 48, borderRadius: 24 }}
        />
        <Text className="text-base text-gray-800 font-medium">{item.name}</Text>
      </View>
      <TouchableOpacity
        className="bg-red-500 px-4 py-2 rounded-full"
        onPress={() => handleUnblock(item.id, item.name)}
      >
        <Text className="text-white font-semibold text-sm">Unblock</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-row items-center justify-between px-4 py-5 border-b border-gray-100 bg-white">
        <Text className="text-xl font-bold text-gray-800">
          Blocked Contacts
        </Text>
        <Ionicons
          name="close"
          size={24}
          color="#3b82f6"
          onPress={() => router.back()}
        />
      </View>
      {blockedUsers?.length === 0 ? (
        <View className="flex-1 items-center justify-center mt-12">
          <Text className="text-gray-500 text-base">
            You haven't blocked anyone.
          </Text>
        </View>
      ) : (
        <FlatList
          data={blockedUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
};

export default BlockedContacts;

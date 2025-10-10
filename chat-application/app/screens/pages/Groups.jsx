import React, { useEffect, useState } from "react";
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
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { getSocket } from "@/app/services/socketService";

const Groups = () => {
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("Groups");
  const [groups, setGroups] = useState([]);
  const navigation = useNavigation();
  const router = useRouter();

  // 🔹 Fetch groups from backend
  const fetchGroupsList = async () => {
    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      console.log("No token found → redirecting to login");
      router.replace("/screens/home");
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.EXPO_API_URL}/groups/list`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // console.log("Groups list:", response.data);

      if (response.data?.success) {
        // Map API data to frontend-friendly format
        const mappedGroups = response.data.data.map((group) => ({
          id: group.id,
          name: group.group_name,
          text: group.last_message || "No messages yet",
          time: group.last_message_time || "",
          active_members: group.active_members,
          groupImage: group.group_picture,
          role: group.user_role,
        }));
        setGroups(mappedGroups);
      }
    } catch (error) {
      console.log("❌ Error fetching groups:", error);
    }
  };

  // 🔍 Filter groups based on search
  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(search.toLowerCase()) ||
      group.text.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Delete group locally
  const handleDeleteGroup = (id) => {
    setGroups((prev) => prev.filter((group) => group.id !== id));
  };

  // ✅ Confirm delete alert
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

useEffect(() => {
  // Initial fetch
  fetchGroupsList();

  const socket = getSocket();

  // 🔔 Listen for server events (group created, joined, left, updated, etc.)
  socket.on("groupUpdated", () => {
    fetchGroupsList(); // refresh when server notifies
  });

  socket.on("groupCreated", () => {
    fetchGroupsList();
  });

  socket.on("groupDeleted", () => {
    fetchGroupsList();
  });

  return () => {
    socket.off("groupUpdated");
    socket.off("groupCreated");
    socket.off("groupDeleted");
  };
}, []);


  return (
    <SafeAreaView className="flex-1 bg-[#f1f5f9]">
      {/* Header */}
      <View className="px-5 pt-6 pb-3 bg-indigo-600 rounded-b-3xl">
        <Image
          source={logoImg}
          style={{ width: 200, height: 46, alignSelf: "center" }}
        />

        {/* Search Bar */}
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
          { title: "Groups", type: "filter" }, // local filter
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              if (item.type === "filter") setSelectedTab("Groups");
              else navigation.navigate(item.screen);
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

      {/* No Groups Found */}
      {filteredGroups.length === 0 && (
        <View className="flex-1 items-center justify-center mt-20 px-6">
          <FontAwesome5 name="users-slash" size={64} color="#9ca3af" />
          <Text className="text-xl font-bold text-gray-700 mt-4">
            No Groups Found
          </Text>
          <Text className="text-sm text-gray-500 mt-2 text-center">
            Try creating a new group or adjust your search.
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/screens/pages/CreateGroup")}
            className="mt-6 bg-indigo-600 px-6 py-3 rounded-full shadow-md"
          >
            <Text className="text-white font-semibold text-base">
              Create New Group
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Groups List */}
      {selectedTab === "Groups" && filteredGroups.length > 0 && (
        <ScrollView
          className="px-4"
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View className="space-y-4 gap-3">
            {filteredGroups.map((group) => (
              <TouchableOpacity
                key={group.id}
                onPress={() =>
                  router.push({
                    pathname: "/screens/pages/GroupMessage",
                    params: { groupedata: JSON.stringify(group) },
                  })
                }
                onLongPress={() => confirmDelete(group.id)}
                delayLongPress={400}
                activeOpacity={0.9}
                className="flex-row justify-between items-center bg-indigo-100 px-4 py-4 rounded-2xl shadow-sm border border-gray-200"
              >
                <View className="flex-row items-center gap-4">
                  {group.groupImage ? (
                    <Image
                      source={{ uri: group.groupImage }}
                      className="w-14 h-14 rounded-full"
                    />
                  ) : (
                    <FontAwesome5 name="users" size={44} color="#6366f1" />
                  )}

                  <View>
                    <Text className="text-lg font-semibold">{group.name}</Text>
                    <Text
                      className="text-gray-800"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{ flexWrap: "wrap", maxWidth: 200 }}
                    >
                      {group.text}
                    </Text>
                    <Text className="text-sm text-gray-500">
                    last message  {new Date(group.time).toLocaleString()} 
                    </Text>
                  </View>
                </View>
                {/* <Text className="text-xs text-gray-400"></Text> */}
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

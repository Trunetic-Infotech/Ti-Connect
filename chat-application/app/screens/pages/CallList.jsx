import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const callsData = [
  {
    id: "1",
    name: "John Doe",
    type: "missed",
    isVideo: false,
    time: "10:30 AM",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    id: "2",
    name: "Jane Smith",
    type: "incoming",
    isVideo: false,
    time: "Yesterday",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    id: "3",
    name: "David Miller",
    type: "outgoing",
    isVideo: true,
    time: "2 days ago",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    id: "4",
    name: "Emma Johnson",
    type: "incoming",
    isVideo: true,
    time: "5:45 PM",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
  },
];

const filters = ["All", "Missed", "Incoming", "Outgoing", "Video"];

export default function CallListScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const filteredData = callsData.filter((call) => {
    const matchesSearch = call.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (activeFilter === "Missed") matchesFilter = call.type === "missed";
    if (activeFilter === "Incoming") matchesFilter = call.type === "incoming";
    if (activeFilter === "Outgoing") matchesFilter = call.type === "outgoing";
    if (activeFilter === "Video") matchesFilter = call.isVideo;

    return matchesSearch && matchesFilter;
  });

  const renderCallItem = ({ item }) => {
    const iconProps = {
      missed: { name: "arrow-down-left", color: "red" },
      incoming: { name: "arrow-down-left", color: "green" },
      outgoing: { name: "arrow-up-right", color: "#007AFF" },
    };

    return (
      <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-300">
        <Image
          source={{ uri: item.avatar }}
          className="w-12 h-12 rounded-full mr-3"
        />
        <View className="flex-1">
          <Text
            className={`text-base font-medium ${
              item.type === "missed" ? "text-red-500" : "text-black"
            }`}
          >
            {item.name}
          </Text>
          <View className="flex-row items-center">
            <Feather
              name={iconProps[item.type]?.name}
              size={14}
              color={iconProps[item.type]?.color}
            />
            <Text className="text-xs text-gray-600 ml-1">{item.time}</Text>
          </View>
        </View>
        {item.isVideo ? (
          <Feather name="video" size={22} color="#007AFF" />
        ) : (
          <Feather name="phone" size={22} color="#007AFF" />
        )}
      </TouchableOpacity>
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-2.5">
      {/* Search Bar */}
      <View className="flex-row items-center bg-gray-100 rounded-full px-3 py-2 my-2.5">
        <Feather name="search" size={18} color="#666" />
        <TextInput
          className="flex-1 ml-1.5 text-base text-gray-800"
          placeholder="Search"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View className="flex-row justify-around bg-white mb-2 py-1">
        {filters.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              className={`px-3.5 py-1.5 rounded-full ${
                isActive ? "bg-[#007AFF]" : "bg-gray-100"
              }`}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                className={`text-sm ${
                  isActive ? "text-white font-semibold" : "text-gray-800"
                }`}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderCallItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text className="text-center mt-5 text-gray-500 text-base">
            No calls found
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

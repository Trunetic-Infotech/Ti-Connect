import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const callsData = [
  {
    id: "1",
    name: "John Doe",
    time: "Today, 3:40 PM",
    type: "incoming",
    dp: "https://i.pravatar.cc/150?img=1",
    isVideo: false,
  },
  {
    id: "2",
    name: "Alice Smith",
    time: "Yesterday, 10:12 AM",
    type: "missed",
    dp: "https://i.pravatar.cc/150?img=2",
    isVideo: true,
  },
  {
    id: "3",
    name: "Mark Lee",
    time: "Today, 12:50 PM",
    type: "outgoing",
    dp: "https://i.pravatar.cc/150?img=3",
    isVideo: false,
  },
  {
    id: "1",
    name: "John Doe",
    time: "Today, 3:40 PM",
    type: "incoming",
    dp: "https://i.pravatar.cc/150?img=1",
    isVideo: false,
  },
  {
    id: "2",
    name: "Alice Smith",
    time: "Yesterday, 10:12 AM",
    type: "missed",
    dp: "https://i.pravatar.cc/150?img=2",
    isVideo: true,
  },
  {
    id: "3",
    name: "Mark Lee",
    time: "Today, 12:50 PM",
    type: "outgoing",
    dp: "https://i.pravatar.cc/150?img=3",
    isVideo: false,
  },
];

const getTypeIcon = (type) => {
  const colorMap = {
    incoming: "#10B981",
    outgoing: "#3B82F6",
    missed: "#EF4444",
  };

  const iconMap = {
    incoming: "arrow-down-left",
    outgoing: "arrow-up-right",
    missed: "arrow-down-right",
  };

  return (
    <Feather
      name={iconMap[type]}
      size={16}
      color={colorMap[type]}
      style={{ marginRight: 6 }}
    />
  );
};

const CallItem = ({ item }) => (
  <View className="flex-row items-center py-3">
    <Image source={{ uri: item.dp }} className="w-12 h-12 rounded-full mr-3" />
    <View className="flex-1">
      <Text className="text-base font-semibold text-gray-900">{item.name}</Text>
      <View className="flex-row items-center mt-0.5">
        {getTypeIcon(item.type)}
        <Text className="text-sm text-gray-500">{item.time}</Text>
      </View>
    </View>
    <TouchableOpacity className="bg-indigo-100 p-2 rounded-full">
      <FontAwesome5
        name={item.isVideo ? "video" : "phone-alt"}
        size={18}
        color="#6366F1"
      />
    </TouchableOpacity>
  </View>
);

const CallList = () => {
  const [searchText, setSearchText] = useState("");

  const filteredCalls = callsData.filter((call) =>
    call.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 bg-gray-50 px-4 pt-4">
        <View className="flex-row items-center bg-white rounded-full px-4 py-2 mb-4 shadow-sm border border-gray-200">
          <Feather name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search"
            value={searchText}
            onChangeText={setSearchText}
            className="ml-2 flex-1 text-sm text-gray-800"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <FlatList
          data={filteredCalls}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CallItem item={item} />}
          ItemSeparatorComponent={() => <View className="h-px bg-gray-200" />}
          ListEmptyComponent={
            <Text className="text-center text-gray-400 mt-8">
              No results found
            </Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default CallList;

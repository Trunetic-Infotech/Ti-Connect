// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   TextInput,
//   TouchableOpacity,
// } from "react-native";
// import { Feather, FontAwesome5 } from "@expo/vector-icons";
// import { SafeAreaView } from "react-native-safe-area-context";

// const callsData = [
//   {
//     id: "1",
//     name: "John Doe",
//     time: "Today, 3:40 PM",
//     type: "incoming",
//     dp: "https://i.pravatar.cc/150?img=1",
//     isVideo: false,
//   },
//   {
//     id: "2",
//     name: "Alice Smith",
//     time: "Yesterday, 10:12 AM",
//     type: "missed",
//     dp: "https://i.pravatar.cc/150?img=2",
//     isVideo: true,
//   },
//   {
//     id: "3",
//     name: "Mark Lee",
//     time: "Today, 12:50 PM",
//     type: "outgoing",
//     dp: "https://i.pravatar.cc/150?img=3",
//     isVideo: false,
//   },
//   {
//     id: "1",
//     name: "John Doe",
//     time: "Today, 3:40 PM",
//     type: "incoming",
//     dp: "https://i.pravatar.cc/150?img=1",
//     isVideo: false,
//   },
//   {
//     id: "2",
//     name: "Alice Smith",
//     time: "Yesterday, 10:12 AM",
//     type: "missed",
//     dp: "https://i.pravatar.cc/150?img=2",
//     isVideo: true,
//   },
//   {
//     id: "3",
//     name: "Mark Lee",
//     time: "Today, 12:50 PM",
//     type: "outgoing",
//     dp: "https://i.pravatar.cc/150?img=3",
//     isVideo: false,
//   },
// ];

// const getTypeIcon = (type) => {
//   const colorMap = {
//     incoming: "#10B981",
//     outgoing: "#3B82F6",
//     missed: "#EF4444",
//   };

//   const iconMap = {
//     incoming: "arrow-down-left",
//     outgoing: "arrow-up-right",
//     missed: "arrow-down-right",
//   };

//   return (
//     <Feather
//       name={iconMap[type]}
//       size={16}
//       color={colorMap[type]}
//       style={{ marginRight: 6 }}
//     />
//   );
// };

// const CallItem = ({ item }) => (
//   <View className="flex-row items-center py-3">
//     <Image source={{ uri: item.dp }} className="w-12 h-12 rounded-full mr-3" />
//     <View className="flex-1">
//       <Text className="text-base font-semibold text-gray-900">{item.name}</Text>
//       <View className="flex-row items-center mt-0.5">
//         {getTypeIcon(item.type)}
//         <Text className="text-sm text-gray-500">{item.time}</Text>
//       </View>
//     </View>
//     <TouchableOpacity className="bg-indigo-100 p-2 rounded-full">
//       <FontAwesome5
//         name={item.isVideo ? "video" : "phone-alt"}
//         size={18}
//         color="#6366F1"
//       />
//     </TouchableOpacity>
//   </View>
// );

// const CallList = () => {
//   const [searchText, setSearchText] = useState("");

//   const filteredCalls = callsData.filter((call) =>
//     call.name.toLowerCase().includes(searchText.toLowerCase())
//   );

//   return (
//     <SafeAreaView className="flex-1">
//       <View className="flex-1 bg-gray-50 px-4 pt-4">
//         <View className="flex-row items-center bg-white rounded-full px-4 py-2 mb-4 shadow-sm border border-gray-200">
//           <Feather name="search" size={18} color="#9CA3AF" />
//           <TextInput
//             placeholder="Search"
//             value={searchText}
//             onChangeText={setSearchText}
//             className="ml-2 flex-1 text-sm text-gray-800"
//             placeholderTextColor="#9CA3AF"
//           />
//         </View>

//         <FlatList
//           data={filteredCalls}
//           keyExtractor={(item) => item.id}
//           renderItem={({ item }) => <CallItem item={item} />}
//           ItemSeparatorComponent={() => <View className="h-px bg-gray-200" />}
//           ListEmptyComponent={
//             <Text className="text-center text-gray-400 mt-8">
//               No results found
//             </Text>
//           }
//         />
//       </View>
//     </SafeAreaView>
//   );
// };

// export default CallList;

import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
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
];

const getTypeIcon = (type) => {
  const colorMap = {
    incoming: "#22C55E",
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

const parseTime = (timeStr) => {
  const [day, time] = timeStr.split(", ");
  const date = new Date();
  if (day === "Yesterday") date.setDate(date.getDate() - 1);
  const [hours, minutes] = time.split(":");
  date.setHours(parseInt(hours));
  date.setMinutes(parseInt(minutes));
  return date;
};

const CallItem = ({ item }) => {
  const initials = item.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <View className="flex-row items-center py-3">
      {item.dp ? (
        <Image
          source={{ uri: item.dp }}
          className="w-12 h-12 rounded-full mr-3"
        />
      ) : (
        <View className="w-12 h-12 rounded-full bg-gray-200 mr-3 items-center justify-center">
          <Text className="text-gray-700 font-semibold">{initials}</Text>
        </View>
      )}
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900">{item.name}</Text>
        <View className="flex-row items-center mt-0.5">
          {getTypeIcon(item.type)}
          <Text className="text-sm text-gray-500">{item.time}</Text>
        </View>
      </View>
      <TouchableOpacity
        className="bg-gray-100 p-2 rounded-full"
        onPress={() =>
          Alert.alert(
            "Calling",
            `${item.name} via ${item.isVideo ? "video" : "audio"} call`
          )
        }
      >
        <FontAwesome5
          name={item.isVideo ? "video" : "phone-alt"}
          size={18}
          color="#4F46E5"
        />
      </TouchableOpacity>
    </View>
  );
};

const CallList = () => {
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredCalls = callsData
    .filter((call) => {
      const matchesSearch = call.name
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const matchesType = filterType === "all" || call.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => parseTime(b.time) - parseTime(a.time));

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4 pt-4">
        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2 mb-4">
          <Feather name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search calls"
            value={searchText}
            onChangeText={setSearchText}
            className="ml-2 flex-1 text-sm text-gray-800"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Filter Buttons */}
        <View className="flex-row justify-around mb-3">
          {["all", "incoming", "outgoing", "missed"].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setFilterType(type)}
              className={`px-3 py-1 rounded-full ${
                filterType === type ? "bg-indigo-500" : "bg-gray-200"
              }`}
            >
              <Text
                className={`text-sm ${
                  filterType === type ? "text-white" : "text-gray-700"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Call List */}
        <FlatList
          data={filteredCalls}
          keyExtractor={(item, index) => `${item.id}-${index}`}
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

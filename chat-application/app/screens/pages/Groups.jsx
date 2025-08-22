// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   ScrollView,
//   TouchableOpacity,
//   Image,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Feather, FontAwesome5 } from "@expo/vector-icons";
// import logoImg from "../../../assets/images/Chat-Logo.png";
// import { useRouter } from "expo-router";

// const groupList = [
//   {
//     id: 1,
//     name: "Friends Group",
//     text: "Let's plan something for weekend.",
//     time: "10:15 AM",
//   },
//   { id: 2, name: "Family Members", text: "Dinner at 8 PM!", time: "Yesterday" },
// ];

// const Groups = () => {
//   const [search, setSearch] = useState("");
//   const router = useRouter();

//   const filteredGroups = groupList.filter(
//     (group) =>
//       group.name.toLowerCase().includes(search.toLowerCase()) ||
//       group.text.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <SafeAreaView className="flex-1 bg-[#f1f5f9]">
//       {/* Header */}
//       <View className="px-5 pt-6 pb-3 bg-indigo-600 rounded-b-3xl">
//         <Image
//           source={logoImg}
//           style={{ width: 200, height: 46, alignSelf: "center" }}
//         />

//         <View className="flex-row items-center bg-white rounded-full px-5 py-0 shadow-sm mt-3">
//           <Feather name="search" size={20} color="#555" />
//           <TextInput
//             placeholder="Search groups..."
//             className="ml-3 flex-1 text-base text-gray-800"
//             placeholderTextColor="#999"
//             value={search}
//             onChangeText={setSearch}
//           />
//         </View>
//       </View>

//       {/* Tabs */}
//       <View className="flex-row justify-between mx-4 mt-5 mb-4">
//         {[
//           { title: "All", path: "../Chats" },
//           { title: "Unread", path: "../pages/UnRead" },
//           { title: "Groups", path: "../pages/Groups" },
//         ].map((item, index) => (
//           <TouchableOpacity
//             key={index}
//             onPress={() => router.push(item.path)}
//             className="flex-1 mx-1 bg-indigo-500 py-2 rounded-full"
//             activeOpacity={0.9}
//           >
//             <Text className="text-center text-white font-semibold">
//               {item.title}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Groups List */}
//       <ScrollView
//         className="px-4"
//         contentContainerStyle={{ paddingBottom: 120 }}
//       >
//         <View className="space-y-4 gap-3">
//           {filteredGroups.map((group) => (
//             <TouchableOpacity
//               key={group.id}
//               onPress={() => router.push("/screens/pages/GroupMessage")}
//               activeOpacity={0.9}
//               className="flex-row justify-between items-center bg-indigo-100 px-4 py-4 rounded-2xl shadow-sm border border-gray-200"
//             >
//               <View className="flex-row items-center gap-4">
//                 <FontAwesome5 name="users" size={44} color="#6366f1" />
//                 <View>
//                   <Text className="text-lg font-semibold text-gray-800">
//                     {group.name}
//                   </Text>
//                   <Text className="text-sm text-gray-500">{group.text}</Text>
//                 </View>
//               </View>
//               <Text className="text-xs text-gray-400">{group.time}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </ScrollView>

//       {/* Floating Button */}
//       <TouchableOpacity
//         onPress={() => router.push("/screens/pages/CreateGroup")}
//         className="absolute bottom-11 right-5 bg-indigo-600 p-3 rounded-full shadow-lg"
//       >
//         <FontAwesome5 name="plus" size={26} color="#fff" />
//       </TouchableOpacity>
//     </SafeAreaView>
//   );
// };

// export default Groups;

//!****************************************************************************************************************************************

// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   ScrollView,
//   TouchableOpacity,
//   Image,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Feather, FontAwesome5 } from "@expo/vector-icons";
// import { useNavigation } from "@react-navigation/native";
// import logoImg from "../../../assets/images/Chat-Logo.png";
// import { useRouter } from "expo-router";
// const router = useRouter();

// const groupList = [
//   {
//     id: 1,
//     name: "Friends Group",
//     text: "Let's plan something for weekend.",
//     time: "10:15 AM",
//     unread: true,
//   },
//   {
//     id: 2,
//     name: "Family Members",
//     text: "Dinner at 8 PM!",
//     time: "Yesterday",
//     unread: false,
//   },
//   {
//     id: 3,
//     name: "Office Team",
//     text: "Project deadline extended.",
//     time: "Monday",
//     unread: true,
//   },
// ];

// const Groups = () => {
//   const [search, setSearch] = useState("");
//   const [selectedTab, setSelectedTab] = useState("Groups");
//   const navigation = useNavigation();

//   // 🔍 Filtered groups (sirf Groups tab ke liye)
//   const filteredGroups = groupList.filter(
//     (group) =>
//       group.name.toLowerCase().includes(search.toLowerCase()) ||
//       group.text.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <SafeAreaView className="flex-1 bg-[#f1f5f9]">
//       {/* Header */}
//       <View className="px-5 pt-6 pb-3 bg-indigo-600 rounded-b-3xl">
//         <Image
//           source={logoImg}
//           style={{ width: 200, height: 46, alignSelf: "center" }}
//         />

//         <View className="flex-row items-center bg-white rounded-full px-5 py-0 shadow-sm mt-3">
//           <Feather name="search" size={20} color="#555" />
//           <TextInput
//             placeholder="Search groups..."
//             className="ml-3 flex-1 text-base text-gray-800"
//             placeholderTextColor="#999"
//             value={search}
//             onChangeText={setSearch}
//           />
//         </View>
//       </View>

//       {/* Tabs */}
//       <View className="flex-row justify-between mx-4 mt-5 mb-4">
//         {[
//           { title: "All", screen: "Chats" },
//           { title: "Unread", screen: "UnRead" },
//           { title: "Groups", screen: "Groups" },
//         ].map((item, index) => (
//           <TouchableOpacity
//             key={index}
//             onPress={() => {
//               setSelectedTab(item.title);
//               navigation.navigate(item.screen);
//             }}
//             className={`flex-1 mx-1 py-2 rounded-full ${
//               selectedTab === item.title ? "bg-indigo-600" : "bg-indigo-300"
//             }`}
//             activeOpacity={0.9}
//           >
//             <Text className="text-center text-white font-semibold">
//               {item.title}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Groups List (sirf Groups tab pe show kare) */}
//       {selectedTab === "Groups" && (
//         <ScrollView
//           className="px-4"
//           contentContainerStyle={{ paddingBottom: 120 }}
//         >
//           <View className="space-y-4 gap-3">
//             {filteredGroups.map((group) => (
//               <TouchableOpacity
//                 key={group.id}
//                 onPress={() => router.push("/screens/pages/GroupMessage")}
//                 activeOpacity={0.9}
//                 className="flex-row justify-between items-center bg-indigo-100 px-4 py-4 rounded-2xl shadow-sm border border-gray-200"
//               >
//                 <View className="flex-row items-center gap-4">
//                   <FontAwesome5 name="users" size={44} color="#6366f1" />
//                   <View>
//                     <Text className="text-lg font-semibold text-gray-800">
//                       {group.name}
//                     </Text>
//                     <Text className="text-sm text-gray-500">{group.text}</Text>
//                   </View>
//                 </View>
//                 <Text className="text-xs text-gray-400">{group.time}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </ScrollView>
//       )}

//       {/* Floating Button */}
//       <TouchableOpacity
//         onPress={() => navigation.navigate("CreateGroup")}
//         className="absolute bottom-11 right-5 bg-indigo-600 p-3 rounded-full shadow-lg"
//       >
//         <FontAwesome5 name="plus" size={26} color="#fff" />
//       </TouchableOpacity>
//     </SafeAreaView>
//   );
// };

// export default Groups;

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
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import logoImg from "../../../assets/images/Chat-Logo.png";

const groupList = [
  {
    id: 1,
    name: "Friends Group",
    text: "Let's plan something for weekend.",
    time: "10:15 AM",
    unread: true,
  },
  {
    id: 2,
    name: "Family Members",
    text: "Dinner at 8 PM!",
    time: "Yesterday",
    unread: false,
  },
  {
    id: 3,
    name: "Office Team",
    text: "Project deadline extended.",
    time: "Monday",
    unread: true,
  },
];

const Groups = () => {
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("Groups");
  const navigation = useNavigation();
  const router = useRouter();

  // 🔍 Filtered groups
  const filteredGroups = groupList.filter(
    (group) =>
      group.name.toLowerCase().includes(search.toLowerCase()) ||
      group.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-[#f1f5f9]">
      {/* Header */}
      <View className="px-5 pt-6 pb-3 bg-indigo-600 rounded-b-3xl">
        <Image
          source={logoImg}
          style={{ width: 200, height: 46, alignSelf: "center" }}
        />

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
          { title: "All", screen: "Chats" },
          { title: "Unread", screen: "UnRead" },
          { title: "Groups", screen: "Groups" },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              setSelectedTab(item.title);
              if (item.screen !== "Groups") {
                navigation.navigate(item.screen);
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

      {/* Groups List (sirf Groups tab pe show kare) */}
      {selectedTab === "Groups" && (
        <ScrollView
          className="px-4"
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View className="space-y-4 gap-3">
            {filteredGroups.map((group) => (
              <TouchableOpacity
                key={group.id}
                onPress={() => router.push("/screens/pages/GroupMessage")}
                activeOpacity={0.9}
                className="flex-row justify-between items-center bg-indigo-100 px-4 py-4 rounded-2xl shadow-sm border border-gray-200"
              >
                <View className="flex-row items-center gap-4">
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
      )}

      {/* Floating Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate("CreateGroup")}
        className="absolute bottom-11 right-5 bg-indigo-600 p-3 rounded-full shadow-lg"
      >
        <FontAwesome5 name="plus" size={26} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Groups;

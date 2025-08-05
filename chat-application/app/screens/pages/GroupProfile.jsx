import React from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Entypo, Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import dp from "../../../assets/images/dp.jpg";

const groupMembers = [
  {
    id: "1",
    name: "Aman Verma",
    role: "Admin",
    avatar: dp,
  },
  {
    id: "2",
    name: "Priya Singh",
    role: "Member",
    avatar: dp,
  },
  {
    id: "3",
    name: "You",
    role: "Member",
    avatar: dp,
  },
];

const GroupProfile = () => {
  const router = useRouter();

  const renderMember = ({ item }) => (
    <View className="flex-row items-center justify-between mb-4">
      <View className="flex-row items-center gap-3">
        <Image
          source={item.avatar}
          style={{ width: 48, height: 48, borderRadius: 24 }}
        />
        <View>
          <Text className="text-base font-medium text-gray-800">
            {item.name}
          </Text>
          <Text className="text-sm text-gray-500">{item.role}</Text>
        </View>
      </View>
      <Feather name="message-circle" size={20} color="#3b82f6" />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <LinearGradient
        colors={["#3b82f6", "#60a5fa"]}
        className="py-6 px-4 rounded-b-3xl shadow"
      >
        <View className="flex-row items-center justify-between">
          <Ionicons
            name="arrow-back"
            size={24}
            color="white"
            onPress={() => router.back()}
          />
          <Entypo name="dots-three-vertical" size={22} color="white" />
        </View>

        <View className="items-center mt-4">
          <Image
            source={dp}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              borderWidth: 2,
              borderColor: "#fff",
            }}
          />
          <Text className="text-xl font-semibold text-white mt-3">
            Design Team
          </Text>
          <Text className="text-sm text-white/80">3 Members</Text>
        </View>
      </LinearGradient>

      <View className="flex-1 px-4 pt-6">
        <Text className="text-lg font-semibold text-gray-800 mb-4">
          Group Members
        </Text>
        .
        <View className="mt-8 space-y-3">
          <TouchableOpacity
            onPress={() => Alert.alert("Add Members", "Feature coming soon")}
            className="bg-blue-500 py-3 rounded-full items-center shadow"
          >
            <Text className="text-white font-semibold text-base">
              Add Members
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              Alert.alert("Leave Group", "You have left the group.")
            }
            className="bg-gray-100 py-3 rounded-full items-center"
          >
            <Text className="text-gray-700 font-semibold text-base">
              Leave Group
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              Alert.alert("Blocked", "This group has been blocked.")
            }
            className="py-3 rounded-full items-center border border-red-500"
          >
            <Text className="text-red-600 font-semibold text-base">
              Block Group
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default GroupProfile;

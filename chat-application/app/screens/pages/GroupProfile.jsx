import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Entypo, Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import dp from "../../../assets/images/dp.jpg";

const initialMembers = [
  { id: "1", name: "Aman Verma", role: "Admin", avatar: dp },
  { id: "2", name: "Priya Singh", role: "Member", avatar: dp },
  { id: "3", name: "You", role: "Member", avatar: dp },
];

const GroupProfile = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [groupName, setGroupName] = useState("Design Team");
  const [groupMembers, setGroupMembers] = useState(initialMembers);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (params.newMembers) {
      try {
        const newMembers = JSON.parse(params.newMembers);
        setGroupMembers((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const filteredNew = newMembers.filter((m) => !existingIds.has(m.id));
          return [...prev, ...filteredNew];
        });
      } catch (e) {
        console.warn("Failed to parse new members from params", e);
      }
    }
    if (params.groupName) {
      setGroupName(params.groupName);
    }
  }, [params.newMembers, params.groupName]);

  const handleDeleteMember = (id) => {
    Alert.alert(
      "Remove Member",
      "Are you sure you want to remove this member?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () =>
            setGroupMembers((prev) => prev.filter((m) => m.id !== id)),
        },
      ]
    );
  };

  const handleBlockToggle = () => {
    Alert.alert(
      isBlocked ? "Unblock Group" : "Block Group",
      isBlocked
        ? "Do you want to unblock this group?"
        : "Are you sure you want to block this group?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isBlocked ? "Unblock" : "Block",
          style: isBlocked ? "default" : "destructive",
          onPress: () => setIsBlocked(!isBlocked),
        },
      ]
    );
  };

  const renderMember = ({ item }) => (
    <View className="flex-row items-center justify-between bg-white rounded-2xl p-4 shadow-md mb-4">
      <View className="flex-row items-center space-x-4 gap-2">
        <Image source={item.avatar} className="w-14 h-14 rounded-full" />
        <View>
          <Text className="text-lg font-semibold text-gray-900">
            {item.name}
          </Text>
          <Text className="text-sm text-gray-500">{item.role}</Text>
        </View>
      </View>

      <View className="flex-row items-center space-x-4">
        <Pressable
          onPress={() => handleDeleteMember(item.id)}
          android_ripple={{ color: "#fee2e2" }}
          className="p-2 rounded-full bg-red-100"
        >
          <Entypo name="trash" size={22} color="#dc2626" />
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={["#3b82f6", "#2563eb"]}
        className="py-6 px-6 rounded-b-3xl shadow-lg"
      >
        <View className="flex-row justify-between items-center">
          <Pressable
            onPress={() => router.push("/screens/pages/GroupMessage")}
            android_ripple={{ color: "rgba(255,255,255,0.3)" }}
            className="p-2 rounded-full"
          >
            <Ionicons name="arrow-back" size={28} color="white" />
          </Pressable>
        </View>

        <View className="items-center mt-6 ">
          <Image
            source={dp}
            className="w-24 h-24 rounded-full border-4 border-white shadow-xl"
          />
          <Text className="text-3xl font-extrabold text-white mt-4">
            {groupName}
          </Text>
          <Text className="text-white/90 mt-1 text-lg">
            {groupMembers.length}
            {groupMembers.length === 1 ? "Member" : "Members"}
          </Text>
          {isBlocked && (
            <Text className="mt-2 text-red-600 font-semibold tracking-wide">
              Group is Blocked
            </Text>
          )}
        </View>
      </LinearGradient>

      {/* Members List */}
      <View className="flex-1 px-6 pt-6">
        <Text className="text-2xl font-semibold text-gray-900 mb-6">
          Group Members
        </Text>

        <FlatList
          data={groupMembers}
          keyExtractor={(item) => item.id}
          renderItem={renderMember}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        />

        {/* Action Buttons */}
        <View className="mt-auto mb-8 space-y-3 gap-4 px-4">
          <Pressable
            onPress={() => router.push("/screens/pages/CreateGroup")}
            disabled={isBlocked}
            className={`rounded-full overflow-hidden shadow-lg ${
              isBlocked ? "opacity-50" : "opacity-100"
            }`}
          >
            <LinearGradient
              colors={["#3b82f6", "#2563eb"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="py-3 items-center justify-center"
            >
              <View className="flex-row items-center justify-center space-x-2">
                <Ionicons name="person-add" size={20} color="#fff" />
                <Text className="text-white font-semibold text-base">
                  Add Members
                </Text>
              </View>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => {
              if (isBlocked) {
                Alert.alert("Blocked", "You cannot leave a blocked group.");
                return;
              }
              Alert.alert("Leave Group", "You have left the group.");
            }}
            className="rounded-full bg-gray-100 shadow-lg py-3 items-center justify-center"
          >
            <View className="flex-row items-center justify-center space-x-2">
              <Entypo name="log-out" size={20} color="#1f2937" />
              <Text className="text-gray-900 font-semibold text-base">
                Leave Group
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={handleBlockToggle}
            className={`rounded-full py-3 items-center justify-center shadow-lg border-2 ${
              isBlocked
                ? "border-green-500 bg-green-50"
                : "border-red-500 bg-red-50"
            }`}
          >
            <View className="flex-row items-center justify-center space-x-2">
              <Feather
                name={isBlocked ? "unlock" : "lock"}
                size={20}
                color={isBlocked ? "#16a34a" : "#dc2626"}
              />
              <Text
                className={`font-semibold text-base ${
                  isBlocked ? "text-green-600" : "text-red-600"
                }`}
              >
                {isBlocked ? "Unblock" : "Block"}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default GroupProfile;

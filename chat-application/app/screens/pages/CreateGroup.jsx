import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const contacts = [
  { id: "1", name: "Aman Verma" },
  { id: "2", name: "John Doe" },
  { id: "3", name: "Priya Sharma" },
  { id: "4", name: "Sana Shaikh" },
  { id: "5", name: "Mohan Rao" },
];

const CreateGroup = () => {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const toggleUser = (user) => {
    if (selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const filteredContact = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      Alert.alert("Group Name Required");
      return;
    }
    if (selectedUsers.length === 0) {
      Alert.alert("Select At Least One Member");
      return;
    }

    router.push({
      pathname: "/screens/pages/GroupProfile",
      params: {
        newMembers: JSON.stringify(selectedUsers),
        groupName,
      },
    });
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white px-4 pt-6"
      edges={["top", "bottom"]}
    >
      <Text className="text-2xl font-bold text-indigo-600 mb-6">
        Create New Group
      </Text>
      <View className="mb-4">
        <Text className="text-sm text-gray-700 mb-1">Group Name</Text>
        <TextInput
          value={groupName}
          onChangeText={setGroupName}
          placeholder="Enter Group Name"
          className="bg-gray-100 px-4 py-3 rounded-xl text-base text-gray-800"
          placeholderTextColor="#999"
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm text-gray-700 mb-1">Add Members</Text>
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2 mb-2">
          <Feather name="search" size={18} color="#666" />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search Contacts..."
            className="ml-2 flex-1 text-gray-800"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <FlatList
        data={filteredContact}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isSelected = selectedUsers.some((u) => u.id === item.id);
          return (
            <TouchableOpacity
              onPress={() => toggleUser(item)}
              className={`flex-row items-center justify-between px-4 py-3 rounded-xl mb-2 ${
                isSelected ? "bg-indigo-100" : "bg-gray-50"
              }`}
            >
              <View className="flex-row items-center gap-3">
                <FontAwesome5 name="user-circle" size={28} color="#6366f1" />
                <Text className="text-base text-gray-800">{item.name}</Text>
              </View>
              {isSelected && (
                <Feather name="check-circle" size={20} color="#4f46e5" />
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-6">
            No matching contacts
          </Text>
        }
      />

      <TouchableOpacity
        onPress={handleCreateGroup}
        activeOpacity={0.9}
        className="mt-6 rounded-2xl shadow-lg"
      >
        <LinearGradient
          colors={["#6366f1", "#3b82f6"]}
          className="py-4 rounded-2xl"
        >
          <Text className="text-center text-white font-bold text-lg">
            Add Selected Members
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default CreateGroup;

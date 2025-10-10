import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome, FontAwesome5, Entypo } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Contacts from "expo-contacts";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const AddContact = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { type } = params;


  try {
    if (typeof params.GroupDetails === "string") {
      params.GroupDetails = JSON.parse(params.GroupDetails);
    }
  } catch (e) {
    console.log("Failed to parse group data:", e);
  }

  const [currentChatUser, setCurrentChatUser] = useState(params.GroupDetails);
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  useEffect(() => {
    setCurrentChatUser(params.GroupDetails);
    // console.log("currentChatUser",currentChatUser);
  }, []);

  // 🔹 Request permission and load contacts
  const loadContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    setPermissionStatus(status);

    if (status !== "granted") return;

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
    });

    setContacts(data);
    setFilteredContacts(data);
  };

  useEffect(() => {
    loadContacts();
  }, []);

  // 🔍 Search filter
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredContacts(contacts);
    } else {
      const lower = searchText.toLowerCase();
      setFilteredContacts(
        contacts.filter(
          (c) =>
            c.name?.toLowerCase().includes(lower) ||
            c.phoneNumbers?.some((p) => p.number?.includes(lower))
        )
      );
    }
  }, [searchText, contacts]);

  const syncContact = async (phone_number, contactName) => {
    let user = null;
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        router.replace("/screens/home");
        return null;
      }

      const response = await axios.post(
        `${process.env.EXPO_API_URL}/get/user/contact`,
        { phone_number, contactName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success && response.data.contact?.id) {
        user = {
          ...response.data.contact,
          name: response.data.name || contactName,
        };

        if (type === "single") {
          Alert.alert(
            "User Found",
            `This user is registered. Do you want to send a message to ${user.name}?`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Send",
                onPress: () =>
                  router.push({
                    pathname: "../Message",
                    params: { user: JSON.stringify(user) },
                  }),
              },
            ]
          );
        }
      } else {
        Alert.alert(
          "Not Registered",
          `${contactName} is not registered in our system.`
        );
      }
    } catch (err) {
      console.error("Contact sync failed:", err);
      Alert.alert(
        "Error",
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to sync contacts"
      );
    }
    return user;
  };

  // Toggle selection in group mode
  const toggleSelectUser = async (contact) => {
    if (!contact.phoneNumbers?.[0]?.number) return;

    const user = await syncContact(
      contact.phoneNumbers[0]?.number,
      contact.name
    );
    if (!user) return;

    setSelectedUsers(
      (prev) =>
        prev.some((u) => u.id === user.id)
          ? prev.filter((u) => u.id !== user.id) // deselect
          : [...prev, user] // select
    );
  };

  // 🔹 Add selected users to group
  const addSelectedUsersToGroup = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert("No users selected", "Please select at least one user.");
      return;
    }

    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        router.replace("/screens/home");
        return;
      }

      const response = await axios.post(
        `${process.env.EXPO_API_URL}/add/members`,
        {
          groupId: currentChatUser.id,
          user_ids: selectedUsers.map((u) => u.id),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        Alert.alert(response.data.message || "Users added successfully");
        setSelectedUsers([]);
        // send back to group chat 
        router.replace({
          pathname: "./GroupMessage",
          params: { GroupDetails: JSON.stringify(response.data.success) },
          type: "group",
        });
      } else {
        Alert.alert("Error", response.data.message || "Failed to add users");
      }
    } catch (error) {
      console.error("Add to group error:", error);
      Alert.alert("Error", "Failed to add users to group");
    }
  };

  // 🔹 Normalize number: remove spaces, dashes, leading +91
  const normalizePhone = (number = "") => {
    return number
      .replace(/\s+/g, "") // remove spaces
      .replace(/-/g, "") // remove dashes
      .replace(/^(\+91|91)/, ""); // remove +91 or 91 prefix
  };

  const isAdmin = currentChatUser?.role?.toLowerCase() === "admin" || "Admin";

  if (permissionStatus === null) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Checking permissions...</Text>
      </View>
    );
  }

  if (permissionStatus !== "granted") {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Permission denied. Allow contacts access.</Text>
        <TouchableOpacity onPress={loadContacts}>
          <Text className="text-blue-400 mt-2">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <LinearGradient
        colors={["#6366f1", "#8b5cf6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="py-5 px-4 rounded-b-3xl shadow-lg"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity onPress={() => router.back()}>
              <FontAwesome name="arrow-left" size={22} color="white" />
            </TouchableOpacity>
            <Text className="font-semibold text-white text-2xl">
              Select Contacts
            </Text>
          </View>
          <View className="flex-row space-x-4">
            <TouchableOpacity onPress={() => setShowSearch((prev) => !prev)}>
              <FontAwesome name="search" size={22} color="white" />
            </TouchableOpacity>
            <Entypo name="dots-three-vertical" size={22} color="white" />
          </View>
        </View>
      </LinearGradient>

      {/* Search */}
      {showSearch && (
        <View className="px-4 mt-3">
          <TextInput
            placeholder="Search by name or number"
            className="bg-gray-100 px-4 py-2 rounded-xl text-gray-800"
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      )}

      {/* Contacts List */}
      <ScrollView className="mt-4 px-4">
        <Text className="text-lg font-semibold text-indigo-800 mb-3">
          Contacts
        </Text>

        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact, i) => {
            const phoneNumber = contact.phoneNumbers?.[0]?.number;

            console.log("selectedUsers", selectedUsers);

            const isSelected = selectedUsers.find(
              (u) =>
                normalizePhone(u.phone_number) === normalizePhone(phoneNumber)
            );

            return (
              <TouchableOpacity
                key={i}
                className={`flex-row items-center justify-between p-3 rounded-xl mb-2 shadow-sm
    ${isSelected ? "bg-indigo-100 border-2 border-indigo-500" : "bg-gray-50"}
  `}
                onPress={() =>
                  isAdmin
                    ? toggleSelectUser(contact)
                    : syncContact(phoneNumber, contact.name)
                }
              >
                <View className="flex-row items-center space-x-4">
                  <View
                    className={`p-2 rounded-full ${
                      isSelected ? "bg-indigo-200" : "bg-indigo-100"
                    }`}
                  >
                    <FontAwesome5
                      name="user-circle"
                      size={28}
                      color={isSelected ? "#4338ca" : "#4f46e5"}
                    />
                  </View>
                  <View>
                    <Text
                      className={`text-base font-medium ${
                        isSelected ? "text-indigo-700" : "text-gray-800"
                      }`}
                    >
                      {contact.name || "No Name"}
                    </Text>
                    <Text
                      className={`text-sm ${
                        isSelected ? "text-indigo-500" : "text-gray-500"
                      }`}
                    >
                      {contact.phoneNumbers?.[0]?.number || "No Number"}
                    </Text>
                  </View>
                </View>

                {isSelected && (
                  <FontAwesome5 name="check-circle" size={20} color="#4338ca" />
                )}
              </TouchableOpacity>
            );
          })
        ) : (
          <Text className="text-center text-gray-400">No contacts found</Text>
        )}
      </ScrollView>

      {/* Add Selected Users Button (Admin only) */}
      {isAdmin && selectedUsers.length > 0 && type === "group" && (
        <TouchableOpacity
          className="bg-indigo-600 py-3 mx-4 mb-4 rounded-xl items-center"
          onPress={addSelectedUsersToGroup}
        >
          <Text className="text-white text-lg font-semibold">
            Add {selectedUsers.length} Selected User
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default AddContact;

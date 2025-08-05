import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  FontAwesome6,
  Entypo,
  FontAwesome,
  FontAwesome5,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";

const AddContact = () => {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");

  const contacts = [
    { number: "+91 647648955", status: "Busy..." },
    { number: "+91 1234567890", status: "Only urgent call" },
    { number: "+91 6476485674", status: "Free..." },
    { number: "+91 1234848955", status: "Busy..." },
    { number: "+91 647648955", status: "Busy..." },
    { number: "+91 1234567890", status: "Only urgent call" },
    { number: "+91 6476485674", status: "Free..." },
    { number: "+91 1234848955", status: "Busy..." },
  ];

  const filteredContacts = contacts.filter((contact) =>
    contact.number.includes(searchText)
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient
        colors={["#6366f1", "#8b5cf6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="py-5 px-4 rounded-b-3xl shadow-lg"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity onPress={() => router.back()} className="p-1">
              <FontAwesome6 name="arrow-left-long" size={22} color="white" />
            </TouchableOpacity>
            <Text className="font-semibold text-white text-2xl">
              Select Contact
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

      {showSearch && (
        <View className="px-4 mt-3">
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search by number"
            className="bg-gray-100 px-4 py-2 rounded-xl text-gray-800"
            placeholderTextColor="#9ca3af"
          />
        </View>
      )}

      <ScrollView className="mt-4 px-4">
        <TouchableOpacity className="flex-row items-center space-x-4 bg-indigo-50 py-3 px-4 rounded-xl mb-3 gap-2">
          <View className="p-3 bg-indigo-200 rounded-full">
            <FontAwesome5 name="users" size={20} color="#4f46e5" />
          </View>
          <Text className="text-base font-medium text-indigo-700">
            New Group
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center space-x-4 bg-indigo-50 py-3 px-4 rounded-xl mb-6 gap-2">
          <View className="p-3 bg-indigo-200 rounded-full">
            <FontAwesome name="user-plus" size={20} color="#4f46e5" />
          </View>
          <Text className="text-base font-medium text-indigo-700">
            New Contact
          </Text>
        </TouchableOpacity>

        <View className="mb-4">
          <Text className="text-lg font-semibold text-indigo-800 mb-3">
            Contacts
          </Text>

          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact, index) => (
              <View
                key={index}
                className="flex-row items-center space-x-4 bg-gray-50 p-3 rounded-xl mb-2 shadow-sm gap-2"
              >
                <View className="p-2 bg-indigo-100 rounded-full">
                  <FontAwesome5 name="user-circle" size={28} color="#4f46e5" />
                </View>
                <View>
                  <Text className="text-base font-medium text-gray-800">
                    {contact.number}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {contact.status}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text className="text-center text-gray-400">No contacts found</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddContact;

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

const BlockedOverlay = ({ onUnblock, onDelete }) => {
  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-6 pb-8 border-t border-gray-100 rounded-t-3xl shadow-2xl">
      <Text className="text-center text-gray-600 text-base font-medium mb-5">
        🔒 You have blocked this contact.
      </Text>

      <View className="flex-row space-x-4 justify-between">
        <TouchableOpacity
          onPress={onUnblock}
          className="flex-1 bg-blue-600 py-3 rounded-full flex-row items-center justify-center shadow-md active:opacity-90"
        >
          <Feather name="unlock" size={20} color="white" />
          <Text className="text-white text-sm font-semibold ml-2">Unblock</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDelete}
          className="flex-1 bg-red-500 py-3 rounded-full flex-row items-center justify-center shadow-md active:opacity-90"
        >
          <Feather name="trash-2" size={20} color="white" />
          <Text className="text-white text-sm font-semibold ml-2">
            Delete Chat
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BlockedOverlay;

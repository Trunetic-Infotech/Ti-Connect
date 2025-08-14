import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

const SelectedMessagesActionBar = ({
  selectedCount,
  onEdit,
  onDelete,
  onCancel,
}) => {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-md rounded-b-xl mx-2 mt-2">
      <Text className="text-gray-800 font-semibold text-base">
        {selectedCount} selected
      </Text>
      <View className="flex-row items-center gap-2 space-x-3">
        {selectedCount === 1 && (
          <TouchableOpacity
            onPress={onEdit}
            className="p-2 rounded-full bg-gray-100 active:bg-gray-200"
          >
            <Feather name="edit-2" size={20} color="#1f2937" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onDelete}
          className="p-2 rounded-full bg-red-100 active:bg-red-200"
        >
          <Feather name="trash-2" size={22} color="red" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onCancel}
          className="p-2 rounded-full bg-gray-100 active:bg-gray-200"
        >
          <Feather name="x" size={22} color="#374151" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SelectedMessagesActionBar;

// components/MessageBubbles/ContactBubble.jsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

const ContactBubble = ({ message, isOwnMessage }) => {
  return (
    <View
      className={`max-w-[75%] p-3 rounded-2xl shadow-md mb-2 ${
        isOwnMessage
          ? "bg-blue-500 ml-auto rounded-tr-sm"
          : "bg-gray-200 mr-auto rounded-tl-sm"
      }`}
    >
      <View className="flex-row items-center mb-2">
        <View className="w-10 h-10 rounded-full bg-gray-300 justify-center items-center mr-3">
          <Feather
            name="user"
            size={20}
            color={isOwnMessage ? "white" : "black"}
          />
        </View>
        <View className="flex-1">
          <Text
            className={`text-base font-semibold ${
              isOwnMessage ? "text-white" : "text-gray-900"
            }`}
          >
            {message.name}
          </Text>
          <Text
            className={`text-sm ${
              isOwnMessage ? "text-gray-200" : "text-gray-700"
            }`}
          >
            {message.phone}
          </Text>
        </View>
      </View>

      {/* Action buttons */}
      <View className="flex-row justify-end space-x-3 mt-1">
        <TouchableOpacity className="flex-row items-center">
          <Feather
            name="phone"
            size={16}
            color={isOwnMessage ? "white" : "#2563eb"}
          />
          <Text
            className={`ml-1 text-xs font-medium ${
              isOwnMessage ? "text-white" : "text-blue-600"
            }`}
          >
            Call
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center">
          <Feather
            name="save"
            size={16}
            color={isOwnMessage ? "white" : "#059669"}
          />
          <Text
            className={`ml-1 text-xs font-medium ${
              isOwnMessage ? "text-white" : "text-green-600"
            }`}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ContactBubble;

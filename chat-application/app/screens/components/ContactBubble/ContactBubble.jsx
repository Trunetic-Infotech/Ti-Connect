import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

const ContactBubble = ({ message, isOwnMessage }) => {
  const contact =
    typeof message.contact_details === "string"
      ? JSON.parse(message.contact_details)
      : message.contact_details || {};

  return (
    <View
      className={`w-full mb-2 p-3 rounded-2xl shadow-lg ${
        isOwnMessage
          ? "bg-blue-500 ml-auto rounded-tr-[8px]"
          : "bg-gray-100 mr-auto rounded-tl-[8px]"
      }`}
      style={{ elevation: 2 }}
    >
      {/* Top Row: User Icon + Name/Phone */}
      <View className="flex-row items-center mb-2">
        {/* <View
          className={`h-12 rounded-full justify-center items-center mr-3 ${
            isOwnMessage ? "bg-blue-400" : "bg-gray-300"
          }`}
        >
          <Feather
            name="user"
            size={22}
            color={isOwnMessage ? "white" : "black"}
          />
        </View> */}

        {/* Name and Phone horizontal */}
        <View className="flex-1 flex-row flex-wrap items-center justify-start">
          <Text
            className={`text-base font-semibold ${
              isOwnMessage ? "text-white" : "text-gray-900"
            }`}
          >
            {contact.name || "Unknown Contact"}
          </Text>
          {contact.phone && (
            <Text
              className={`text-sm  ${
                isOwnMessage ? "text-gray-200" : "text-gray-700"
              }`}
            >
               {contact.phone}
            </Text>
          )}
        </View>
      </View>

      {/* Email row (if exists) */}
      {contact.email && (
        <Text
          className={`text-xs mb-2 ${
            isOwnMessage ? "text-gray-200" : "text-gray-600"
          }`}
        >
          {contact.email}
        </Text>
      )}

      {/* Action Buttons */}
      <View className="flex-row justify-start space-x-4 gap-2 mt-1">
        <TouchableOpacity
          className="flex-row items-center px-3 py-1 rounded-lg bg-green-100"
          onPress={() => console.log("Call pressed")}
        >
          <Feather
            name="phone"
            size={16}
            color={ "#059669"}
          />
          <Text
            className={`ml-1 text-xs font-semibold ${
              "text-green-700"
            }`}
          >
            Call
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center px-3 py-1 rounded-lg bg-blue-100"
          onPress={() => console.log("Save pressed")}
        >
          <Feather
            name="save"
            size={16}
            color={"#2563eb"}
          />
          <Text
            className={`ml-1 text-xs font-semibold ${
              "text-blue-700"
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

import { View, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

const SendMessageBar = ({ onSend }) => {
  const [messageText, setMessageText] = useState("");

  const handleSendPress = () => {
    if (!messageText.trim()) return;
    onSend(messageText.trim());
    setMessageText("");
  };

  return (
    <View className="p-2.5 bg-white">
      <View className="flex-row items-center bg-white rounded-full px-4 py-2 shadow-md shadow-black/10">
        <TouchableOpacity className="p-2">
          <Feather name="paperclip" size={22} color="#555" />
        </TouchableOpacity>

        <TextInput
          className="flex-1 text-base mx-2 text-[#111] py-1"
          placeholder="Type a message..."
          placeholderTextColor="#888"
          value={messageText}
          onChangeText={setMessageText}
          multiline
        />

        {messageText.trim() === "" ? (
          <MaterialCommunityIcons name="microphone" size={24} color="#3b82f6" />
        ) : (
          <TouchableOpacity
            onPress={handleSendPress}
            className="p-2 rounded-full bg-blue-500"
          >
            <Feather name="send" size={18} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SendMessageBar;

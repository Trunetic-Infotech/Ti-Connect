import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { pushNewMessage } from "../../../redux/features/messagesSlice"; 
import { getSocket } from "../../../services/socketService";
import { set } from "date-fns";

const SendMessageBar = ({handleGetMessage}) => {
  const [attachmentOptionsVisible, setAttachmentOptionsVisible] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messagetype,setMessageType] = useState("text");
  const [media,setMedia] = useState(null);
  const [recording, setRecording] = useState(false);
  const dispatch = useDispatch();
  const myId = useSelector((state) => state.auth?.user?.id);
   const { user } = useLocalSearchParams();
  const parsedUser = user ? JSON.parse(user) : null;
  

   // 🔹 Handle Send
  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
  const msgData = {
    // sender_id: myId,
    receiver_id: parsedUser?.id,
    message: messageText,
    message_type: "text",
    created_at: new Date().toISOString(),
    myId: myId, // ✅ needed for messagesSlice addMessage logic
  };

    try {

        // 1️⃣ Emit via socket (real-time)
    const socket = getSocket();
    if (socket) {
      socket.emit("newMessage", msgData);
    }

    // 2️⃣ Optimistically add to Redux
    dispatch(pushNewMessage(msgData));

    // 3️⃣ Clear input
    setMessageText("");


      const token = await SecureStore.getItemAsync("token");

      const response = await axios.post(
        `${process.env.EXPO_API_URL}/messages`, 
         msgData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  console.log("responsedaya",response.data);
  
      if (response.data.success) {
        setMessageText(""); // ✅ clear input after sending
        handleGetMessage();
      } else {
        console.log("Error sending message:", response.data.message);
        Alert.alert("Error", "Failed to send message.");
      }
    } catch (error) {
      console.error("❌ API Error:", error.response?.data || error.message);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  useEffect(()=>{

    const socket= getSocket();

    if(!socket) return;

    const handleNewMessage = (msgData)=>{
      if(msgData.sender_id === myId || msgData.receiver_id === myId){
         dispatch(pushNewMessage(msgData));
      }
    };

    socket.on("newMessage",handleNewMessage);
    
   return ()=>{
    socket.off("newMessage",handleNewMessage);
   }


  },[myId, dispatch])


  return (
    <View className="bg-white border-t border-gray-200 p-2.5">
      {/* 🔹 Click outside to close attachment options */}
      {attachmentOptionsVisible && (
        <TouchableWithoutFeedback onPress={() => setAttachmentOptionsVisible(false)}>
          <View className="absolute inset-0 z-20" />
        </TouchableWithoutFeedback>
      )}

      {/* 🔹 Attachment Options Modal */}
      {attachmentOptionsVisible && (
        <View className="absolute bottom-16 right-4 bg-white rounded-2xl shadow-2xl p-4 w-56 space-y-4 border border-gray-100 z-30">
          <Text className="text-center text-gray-700 font-semibold text-sm">
            Send Attachment
          </Text>

          <View className="flex flex-wrap flex-row justify-between">
            {/* 📸 Camera */}
            <TouchableOpacity className="items-center w-[30%] mb-4">
              <View className="w-14 h-14 bg-blue-100 rounded-full justify-center items-center mb-1">
                <Feather name="camera" size={22} color="#2563eb" />
              </View>
              <Text className="text-xs text-center text-gray-700">Camera</Text>
            </TouchableOpacity>

            {/* 🖼️ Gallery */}
            <TouchableOpacity className="items-center w-[30%] mb-4">
              <View className="w-14 h-14 bg-green-100 rounded-full justify-center items-center mb-1">
                <Feather name="image" size={22} color="#059669" />
              </View>
              <Text className="text-xs text-center text-gray-700">Gallery</Text>
            </TouchableOpacity>

            {/* 📄 Document */}
            <TouchableOpacity className="items-center w-[30%] mb-4">
              <View className="w-14 h-14 bg-yellow-100 rounded-full justify-center items-center mb-1">
                <Feather name="file-text" size={22} color="#d97706" />
              </View>
              <Text className="text-xs text-center text-gray-700">Document</Text>
            </TouchableOpacity>

            {/* 🎥 Video */}
            <TouchableOpacity className="items-center w-[30%] mb-4">
              <View className="w-14 h-14 bg-red-100 rounded-full justify-center items-center mb-1">
                <Feather name="video" size={22} color="#dc2626" />
              </View>
              <Text className="text-xs text-center text-gray-700">Video</Text>
            </TouchableOpacity>

            {/* 🎵 Audio */}
            <TouchableOpacity className="items-center w-[30%] mb-2">
              <View className="w-14 h-14 bg-purple-100 rounded-full justify-center items-center mb-1">
                <Feather name="music" size={22} color="#9333ea" />
              </View>
              <Text className="text-xs text-center text-gray-700">Audio</Text>
            </TouchableOpacity>

            {/* 👤 Contact */}
            <TouchableOpacity className="items-center w-[30%] mb-4">
              <View className="w-14 h-14 bg-pink-100 rounded-full justify-center items-center mb-1">
                <Feather name="user" size={22} color="#db2777" />
              </View>
              <Text className="text-xs text-center text-gray-700">Contact</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 🔹 Input + Actions */}
      <View className="flex-row items-center bg-white rounded-full px-4 py-2 shadow-md shadow-black/10">
        {/* 📎 Attach Button */}
        <TouchableOpacity
          className="p-2"
          onPress={() => setAttachmentOptionsVisible(!attachmentOptionsVisible)}
        >
          <Feather name="paperclip" size={22} color="#555" />
        </TouchableOpacity>

        {/* 📝 Message Input */}
        <TextInput
          className="flex-1 text-base mx-2 text-[#111] py-1"
          placeholder="Type a message..."
          placeholderTextColor="#888"
          value={messageText}
          onChangeText={setMessageText}
          multiline
          onFocus={() => setAttachmentOptionsVisible(false)}
        />

        {/* 🎤 Mic or 📤 Send Button */}
        {messageText.trim() === "" ? (
          <TouchableOpacity onPress={() => setRecording(!recording)}>
            <Feather
              name={recording ? "square" : "mic"}
              size={24}
              color="#3b82f6"
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="p-2 rounded-full bg-blue-500"
            onPress={handleSendMessage} // ✅ now sends API request
          >
            <Feather name="send" size={18} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SendMessageBar;



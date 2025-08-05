import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  Entypo,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import dp from "../../../assets/images/dp.jpg";
import GroupProfile from "./GroupProfile";

const groupMessages = [
  {
    id: 1,
    sender: "Aman",
    text: "Hey team! 👋",
    avatar: dp,
  },
  {
    id: 2,
    sender: "Priya",
    text: "Hi Aman! Working on the design update.",
    avatar: dp,
  },
  {
    id: 3,
    sender: "You",
    text: "Great! Let me know if any help is needed 💻",
    avatar: dp,
  },
];

const GroupMessage = () => {
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState(groupMessages);
  const router = useRouter();

  const renderMessage = ({ item }) => {
    const isMe = item.sender === "You";

    const Bubble = ({ children }) => (
      <View
        className={`max-w-[75%] my-2 ${
          isMe ? "self-end items-end" : "self-start items-start"
        }`}
      >
        {!isMe && (
          <View className="flex-row items-center mb-1">
            <Image
              source={item.avatar}
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                marginRight: 6,
              }}
            />
            <Text className="text-gray-600 text-xs font-semibold">
              {item.sender}
            </Text>
          </View>
        )}
        <LinearGradient
          colors={isMe ? ["#3b82f6", "#60a5fa"] : ["#fcd34d", "#fde68a"]}
          className={`px-4 py-3 rounded-2xl ${
            isMe ? "rounded-br-none" : "rounded-bl-none"
          } shadow`}
        >
          {children}
        </LinearGradient>
      </View>
    );

    return (
      <Bubble>
        <Text
          className={`text-base ${isMe ? "text-white" : "text-gray-800"} leading-relaxed`}
        >
          {item.text}
        </Text>
      </Bubble>
    );
  };

  const handleSend = () => {
    if (messageText.trim() === "") return;

    const newMsg = {
      id: Date.now(),
      sender: "You",
      text: messageText,
      avatar: dp,
    };
    setMessages([newMsg, ...messages]);
    setMessageText("");
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <LinearGradient
              colors={["#3b82f6", "#60a5fa"]}
              className="py-5 px-4 rounded-b-3xl shadow-md"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <Ionicons
                    name="arrow-back"
                    size={24}
                    color="white"
                    onPress={() => router.back()}
                  />
                  <TouchableOpacity
                    onPress={() => router.push("/screens/pages/GroupProfile")}
                  >
                    <View>
                      <Text className="font-semibold text-white text-base">
                        Design Team
                      </Text>
                      <Text className="text-xs text-white/80">
                        3 members online
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity>
                  <Entypo name="dots-three-vertical" size={22} color="white" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <LinearGradient
              colors={["#f0f9ff", "#e0f2fe", "#fef9c3"]}
              className="flex-1"
            >
              <FlatList
                data={messages}
                renderItem={renderMessage}
                contentContainerStyle={{ padding: 16 }}
                inverted
              />
            </LinearGradient>

            <View className="bg-white px-4 py-3 border-t border-gray-200">
              <View className="flex-row items-center gap-2 bg-gray-100 rounded-full px-4 py-2 shadow-sm">
                <MaterialCommunityIcons
                  name="emoticon-outline"
                  size={22}
                  color="#555"
                />
                <Feather name="paperclip" size={22} color="#555" />
                <TextInput
                  className="flex-1 text-base text-gray-800 pl-2"
                  placeholder="Type a message..."
                  placeholderTextColor="#888"
                  value={messageText}
                  onChangeText={setMessageText}
                />
                {messageText.trim() === "" ? (
                  <MaterialCommunityIcons
                    name="microphone"
                    size={22}
                    color="#3b82f6"
                  />
                ) : (
                  <TouchableOpacity onPress={handleSend}>
                    <Feather name="send" size={22} color="#3b82f6" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default GroupMessage;

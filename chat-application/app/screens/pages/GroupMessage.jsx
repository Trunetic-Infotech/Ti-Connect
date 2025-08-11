import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import dp from "../../../assets/images/dp.jpg";
import SendMessageBar from "../components/SenderMessage/SendMessageBar";

const initialMessages = [
  { id: 1, sender: "Aman", text: "Hey team! 👋", avatar: dp },
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
  const [messages, setMessages] = useState([]);
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const animateMessage = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    setTimeout(() => {
      setMessages(initialMessages);
      animateMessage();
    }, 300);
  }, []);

  const renderMessage = ({ item }) => {
    const isMe = item.sender === "You";
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }}
      >
        <View
          className={`max-w-[75%] my-2 ${isMe ? "self-end items-end" : "self-start items-start"}`}
        >
          {!isMe && (
            <View className="flex-row items-center mb-1">
              <Image
                source={item.avatar}
                className="w-[26px] h-[26px] rounded-full mr-1.5"
              />
              <Text className="text-gray-500 text-xs font-semibold">
                {item.sender}
              </Text>
            </View>
          )}

          {/* Message bubble */}
          <View
            className={`py-2.5 px-3.5 rounded-[18px] shadow-md ${
              isMe
                ? "bg-indigo-700 rounded-br-none"
                : "bg-yellow-400 rounded-bl-none"
            }`}
          >
            <Text
              className={`text-[15px] leading-5 ${isMe ? "text-white" : "text-gray-800"}`}
            >
              {item.text}
            </Text>

            {/* Time below text */}
            {item.time && (
              <Text
                className={`text-[10px] mt-1 ${isMe ? "text-white/70" : "text-gray-700/70"}`}
              >
                {item.time}
              </Text>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
          {/* Header */}
          <LinearGradient
            colors={["#4f8ef7", "#2563eb"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderBottomLeftRadius: 18,
              borderBottomRightRadius: 18,
              overflow: "hidden",
            }}
          >
            <BlurView intensity={45} tint="light" className="py-2.5 px-3.5">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => router.back()}
                    className="p-2 rounded-full bg-white/15"
                  >
                    <Ionicons name="arrow-back" size={22} color="white" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push("/screens/pages/GroupProfile")}
                    activeOpacity={0.8}
                    className="flex-row items-center ml-2.5"
                  >
                    <Image
                      source={dp}
                      className="w-9 h-9 rounded-full mr-2 border border-white/25"
                    />
                    <View>
                      <Text className="font-semibold text-base text-white">
                        Design Team
                      </Text>
                      <Text className="text-xs text-white/80">
                        3 members online
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity className="p-2 rounded-full bg-white/15">
                  <Entypo name="dots-three-vertical" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </BlurView>
          </LinearGradient>

          {/* Messages */}
          <View className="flex-1 bg-yellow-100">
            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
                inverted
                showsVerticalScrollIndicator={false}
              />
            </Animated.View>
          </View>

          {/* Input */}
          <SendMessageBar
            onSend={(msg) => {
              const newMsg = {
                id: Date.now(),
                sender: "You",
                text: msg,
                avatar: dp,
                time: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              };
              setMessages([newMsg, ...messages]);
              animateMessage();
              setTimeout(() => {
                flatListRef.current?.scrollToOffset({
                  offset: 0,
                  animated: true,
                });
              }, 100);
            }}
          />
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default GroupMessage;

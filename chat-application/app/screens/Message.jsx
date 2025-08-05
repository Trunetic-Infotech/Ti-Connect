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
  FontAwesome6,
  Entypo,
  Feather,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import img from "../../assets/images/dp.jpg";

const messagesData = [
  { text: "Hey there! 👋", sender: "other" },
  { text: "Hi! How are you doing today?", sender: "me" },
  { text: "I'm great, just working on a project!", sender: "other" },
  { text: "Sounds awesome! Keep it up 💪", sender: "me" },
  { text: "By the way, are we meeting later?", sender: "other" },
  { text: "Yes, around 6 PM!", sender: "me" },
];

const Message = () => {
  const [messageText, setMessageText] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const router = useRouter();

  const renderMessage = ({ item }) => {
    const isMe = item.sender === "me";

    const Bubble = ({ children }) =>
      isMe ? (
        <LinearGradient
          colors={["#3b82f6", "#60a5fa"]}
          className="px-4 py-3 rounded-2xl my-1 self-end rounded-br-none max-w-[75%] shadow"
        >
          {children}
        </LinearGradient>
      ) : (
        <LinearGradient
          colors={["#4fcd3d", "#fde68a"]}
          className="px-4 py-3 rounded-xl my-1 self-start rounded-bl-none max-w-[75%] shadow"
        >
          {children}
        </LinearGradient>
      );

    return (
      <Bubble>
        <Text
          className={`text-base ${
            isMe ? "text-white" : "text-gray-800"
          } leading-relaxed`}
        >
          {item.text}
        </Text>
      </Bubble>
    );
  };

  const handleAudioCall = () => {
    Alert.alert("Audio Call", "Starting audio call...");
  };

  const handleVideoCall = () => {
    Alert.alert("Video Call", "Starting video call...");
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
                  <FontAwesome6
                    onPress={() => router.back()}
                    name="arrow-left-long"
                    size={22}
                    color="white"
                  />
                  <TouchableOpacity>
                    <Image
                      source={img}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        borderWidth: 2,
                        borderColor: "#fff",
                      }}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.push("/screens/pages/ProfileEdit")}
                  >
                    <Text className="font-semibold text-white text-base">
                      Aman Verma
                    </Text>
                    <Text className="text-xs text-white/80">
                      Last seen 10:59am
                    </Text>
                  </TouchableOpacity>
                </View>
                <View className="flex-row gap-4">
                  <TouchableOpacity onPress={handleAudioCall}>
                    <Ionicons name="call" size={22} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleVideoCall}>
                    <Ionicons name="videocam" size={22} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setDropdownVisible(true)}>
                    <Entypo
                      name="dots-three-vertical"
                      size={22}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>

            <LinearGradient
              colors={["#f0f9ff", "#e0f2fe", "#fef9c3"]}
              className="flex-1"
            >
              <FlatList
                data={messagesData}
                renderItem={renderMessage}
                contentContainerStyle={{ padding: 16 }}
                inverted
                keyboardShouldPersistTaps="handled"
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
                  <TouchableOpacity
                    onPress={() => {
                      messagesData.unshift({
                        text: messageText,
                        sender: "me",
                      });
                      setMessageText("");
                    }}
                  >
                    <Feather name="send" size={22} color="#3b82f6" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {dropdownVisible && (
              <TouchableOpacity
                className="absolute top-36 right-3 z-10"
                activeOpacity={1}
                onPress={() => setDropdownVisible(false)}
              >
                <View className="absolute top-0 right-4 bg-white rounded-lg shadow p-3 w-40">
                  <TouchableOpacity
                    onPress={() => {
                      setDropdownVisible(false);
                      Alert.alert("Blocked", "Contact has been blocked.");
                    }}
                    className="py-2"
                  >
                    <Text className="text-red-600 text-base text-center font-semibold">
                      Block Contact
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Message;

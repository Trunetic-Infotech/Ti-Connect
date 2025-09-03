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
  Animated,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import dp from "../../assets/images/dp.jpg";

import SendMessageBar from "../screens/components/SenderMessage/SendMessageBar";
import BlockedOverlay from "../screens/components/BlockContact/BlockedOverlay";
import SelectedMessagesActionBar from "../screens/components/SelectedMessagesActionBar/SelectedMessagesActionBar";
import MessagesList from "../screens/components/MessagesList/MessagesList";

import AsyncStorage from "@react-native-async-storage/async-storage";
import OneToOneChatHeader from "./components/OneToOneChatHeader/OneToOneChatHeader";

const initialMessages = [
  {
    id: 1,
    sender: "Priya",
    text: "Hi Aman! Working on the design update.",
    avatar: dp,
  },
  {
    id: 2,
    sender: "You",
    text: "Great! Let me know if any help is needed 💻",
    avatar: dp,
  },
];

const GroupMessage = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [hasLeftGroup, setHasLeftGroup] = useState(false);
  const [wallpaperUri, setWallpaperUri] = useState(null);

  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  

  
  useEffect(() => {
    setTimeout(() => {
      setMessages(initialMessages);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 300);
  }, []);

  useEffect(() => {
    (async () => {
      const uri = await AsyncStorage.getItem("chat_wallpaper");
      setWallpaperUri(uri || null);
    })();
  }, []);

  const toggleMessageSelection = (id) => {
    setSelectedMessages((prev) =>
      prev.includes(id) ? prev.filter((msgId) => msgId !== id) : [...prev, id]
    );
  };

  const handleLongPress = (item) => {
    toggleMessageSelection(item.id);
  };

  const deleteSelectedMessages = () => {
    Alert.alert(
      "Delete Messages",
      `Are you sure you want to delete ${selectedMessages.length} message(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setMessages((prev) =>
              prev.filter((msg) => !selectedMessages.includes(msg.id))
            );
            setSelectedMessages([]);
            setEditingMessageId(null);
            setMessageText("");
          },
        },
      ]
    );
  };

  const cancelSelection = () => {
    setSelectedMessages([]);
    setEditingMessageId(null);
    setMessageText("");
  };

  const editSelectedMessage = () => {
    if (selectedMessages.length === 1) {
      const msgToEdit = messages.find((msg) => msg.id === selectedMessages[0]);
      if (msgToEdit) {
        setEditingMessageId(msgToEdit.id);
        setMessageText(msgToEdit.text);
        setSelectedMessages([]);
      }
    }
  };

  const handleSend = (message) => {
    if (editingMessageId && message.type === "text") {
      // Editing a text message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === editingMessageId ? { ...msg, text: message.text } : msg
        )
      );
      setEditingMessageId(null);
      setMessageText("");
    } else {
      // New message (text or image)
      const newMsg = {
        id: Date.now(),
        sender: "You",
        avatar: dp,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        ...message, // Spread type, text, uri
      };
      setMessages((prev) => [newMsg, ...prev]);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);

      if (message.type === "text") {
        setMessageText("");
      }
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSelectedMessages([]);
    setEditingMessageId(null);
  };

  const handleWallpaperChange = async (uri) => {
    if (uri) {
      setWallpaperUri(uri);
      await AsyncStorage.setItem("chat_wallpaper", uri);
    } else {
      setWallpaperUri(null);
      await AsyncStorage.removeItem("chat_wallpaper");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
          {/* <GroupChatHeader
            onWallpaperChange={handleWallpaperChange}
            onBlock={() => setIsBlocked(true)}
            onClearChat={clearChat}
            onLeaveGroup={() => {
              Alert.alert(
                "Leave Group",
                "Are you sure you want to leave this group? You won't be able to send or receive messages after leaving.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Leave",
                    style: "destructive",
                    onPress: () => {
                      setHasLeftGroup(true);
                      setSelectedMessages([]);
                      setEditingMessageId(null);
                      setMessageText("");
                    },
                  },
                ]
              );
            }}
          /> */}

          <OneToOneChatHeader
            // user={currentChatUser}
            onWallpaperChange={handleWallpaperChange}
            onBlock={() => setIsBlocked(true)}
            onClearChat={clearChat}
          />

          {hasLeftGroup ? (
            <View className="flex-1 justify-center items-center px-4">
              <Text className="text-center text-gray-600 text-lg">
                You have left this group. You cannot send or receive messages.
              </Text>
              <TouchableOpacity
                onPress={() => router.back()}
                className="mt-4 px-5 py-2 bg-indigo-600 rounded-full"
              >
                <Text className="text-white font-semibold text-center">
                  Back to Groups
                </Text>
              </TouchableOpacity>
            </View>
          ) : isBlocked ? (
            <BlockedOverlay
              onUnblock={() => setIsBlocked(false)}
              onDelete={() => {
                Alert.alert(
                  "Delete Chat",
                  "Are you sure you want to delete this chat?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => {
                        setMessages([]);
                        setIsBlocked(false);
                        router.back();
                      },
                    },
                  ]
                );
              }}
            />
          ) : (
            <>
              {selectedMessages.length > 0 && (
                <SelectedMessagesActionBar
                  selectedCount={selectedMessages.length}
                  onEdit={editSelectedMessage}
                  onDelete={deleteSelectedMessages}
                  onCancel={cancelSelection}
                />
              )}

              <MessagesList
                messages={messages}
                onLongPress={handleLongPress}
                selectedMessages={selectedMessages}
                fadeAnim={fadeAnim}
                flatListRef={flatListRef}
                wallpaperUri={wallpaperUri}
              />

              <SendMessageBar
                messageText={messageText}
                setMessageText={setMessageText}
                editingMessageId={editingMessageId}
                cancelEditing={cancelSelection}
                onSend={handleSend}
              />
            </>
          )}
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default GroupMessage;

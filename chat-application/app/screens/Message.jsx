import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import axios from "axios";

import { getSocket } from "../services/socketService";

import OneToOneChatHeader from "./components/OneToOneChatHeader/OneToOneChatHeader";
import MessagesList from "../screens/components/MessagesList/MessagesList";
import SendMessageBar from "../screens/components/SenderMessage/SendMessageBar";
import BlockedOverlay from "../screens/components/BlockContact/BlockedOverlay";
import SelectedMessagesActionBar from "../screens/components/SelectedMessagesActionBar/SelectedMessagesActionBar";

const Message = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const me = useSelector((state) => state.auth.user);

  const [currentChatUser, setCurrentChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [wallpaperUri, setWallpaperUri] = useState(null);
  const [type, setType] = useState("single");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  // ------------------ Parse user param ------------------
  useEffect(() => {
    let userParam = params.user;
    try {
      if (typeof userParam === "string") userParam = JSON.parse(userParam);
      setCurrentChatUser(userParam);
    } catch (e) {
      console.warn("Failed to parse user param:", e);
    }
  }, [params.user]);

  // ------------------ Load Wallpaper ------------------
  useEffect(() => {
    (async () => {
      const uri = await AsyncStorage.getItem("chat_wallpaper");
      setWallpaperUri(uri || null);
    })();
  }, []);

  // ------------------ Fetch Messages ------------------
  const fetchMessages = useCallback(async () => {
    if (!currentChatUser?.id) return;
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) return Alert.alert("Error", "No token found");

      const response = await axios.get(
        `${process.env.EXPO_API_URL}/get/messages`,
        {
          params: { receiver_id: currentChatUser.id },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setMessages(response.data.messages || []);
        setType("single");
      } else {
        Alert.alert("Error", response.data.message || "Failed to fetch messages");
      }
    } catch (err) {
      console.error("Fetch messages error:", err);
    }
  }, [currentChatUser?.id]);

  useEffect(() => {
    fetchMessages();

    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (
        (msg.sender_id === me.id && msg.receiver_id === currentChatUser?.id) ||
        (msg.sender_id === currentChatUser?.id && msg.receiver_id === me.id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [fetchMessages, currentChatUser?.id]);

  // ------------------ Message Selection ------------------
  const toggleMessageSelection = (id) => {
    console.log(id);
    
    setSelectedMessages((prev) =>
      prev.includes(id) ? prev.filter((msgId) => msgId !== id) : [...prev, id]
    );
  };

  const handleLongPress = (item) => toggleMessageSelection(item.id);

  const cancelSelection = () => {
    setSelectedMessages([]);
    setEditingMessageId(null);
    setMessageText("");
  };

  // ------------------ Delete Messages ------------------
  const deleteSelectedMessages = async () => {
    // if (!selectedMessages.length) return Alert.alert("No messages selected");
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) return Alert.alert("Error", "No token found");

      Alert.alert(
        "Delete Messages",
        `Are you sure you want to delete ${selectedMessages.length} message(s)?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              // Loop to delete all selected messages
              await Promise.all(
                selectedMessages.map((msgId) =>
                  axios.delete(`${process.env.EXPO_API_URL}/messages/${msgId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  })
                )
              );

              setMessages((prev) =>
                prev.filter((msg) => !selectedMessages.includes(msg.id))
              );
              cancelSelection();
            },
          },
        ]
      );
    } catch (err) {
      console.error("Delete message error:", err);
    }
  };

  // ------------------ Edit Message ------------------
  const editSelectedMessage = async () => {
    if (!selectedMessages.length) return Alert.alert("No message selected");
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) return Alert.alert("Error", "No token found");

      const msgId = selectedMessages[0];
      const response = await axios.put(
        `${process.env.EXPO_API_URL}/messages/${msgId}`,
        { message: messageText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === msgId ? { ...msg, message: messageText } : msg
          )
        );
        cancelSelection();
      }
    } catch (err) {
      console.error("Edit message error:", err);
    }
  };

  // ------------------ Send Message ------------------
  const handleSend = async () => {
    if (!messageText.trim()) return;

    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) return Alert.alert("Error", "No token found");

      const response = await axios.post(
        `${process.env.EXPO_API_URL}/messages`,
        { message: messageText, receiver_id: currentChatUser.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessages((prev) => [...prev, response.data.message]);
        setMessageText("");
      }
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  // ------------------ Clear Chat ------------------
  const clearChat = () => {
    setMessages([]);
    cancelSelection();
  };

  // ------------------ Change Wallpaper ------------------
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
          {/* Chat Header */}
          <OneToOneChatHeader
            onWallpaperChange={handleWallpaperChange}
            onBlock={() => setIsBlocked(true)}
            onClearChat={clearChat}
            user={currentChatUser}
          />

          {/* Blocked Overlay */}
          {isBlocked ? (
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
              {/* Selected Messages Action Bar */}
              {selectedMessages.length > 0 && (
                <SelectedMessagesActionBar
                  selectedCount={selectedMessages.length}
                  onEdit={editSelectedMessage}
                  onDelete={deleteSelectedMessages}
                  onCancel={cancelSelection}
                />
              )}

              {/* Messages List */}
              <MessagesList
                type={type}
                messages={messages}
                user={currentChatUser}
                onLongPress={handleLongPress}
                selectedMessages={selectedMessages}
                fadeAnim={fadeAnim}
                flatListRef={flatListRef}
                wallpaperUri={wallpaperUri}
                onDeleteMessage={deleteSelectedMessages} // For real-time delete
                onEditMessage={editSelectedMessage} // For real-time edit
              />

              {/* Send Message Bar */}
              <SendMessageBar
                type={type}
                messageText={messageText}
                setMessageText={setMessageText}
                editingMessageId={editingMessageId}
                cancelEditing={cancelSelection}
                onSend={handleSend}
                user={currentChatUser}
                handleGetMessage={fetchMessages}
              />
            </>
          )}
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Message;

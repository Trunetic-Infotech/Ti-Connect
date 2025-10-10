import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getSocket } from "../services/socketService";

import dp from "../../assets/images/dp.jpg";

import SendMessageBar from "../screens/components/SenderMessage/SendMessageBar";
import BlockedOverlay from "../screens/components/BlockContact/BlockedOverlay";
import SelectedMessagesActionBar from "../screens/components/SelectedMessagesActionBar/SelectedMessagesActionBar";
import MessagesList from "../screens/components/MessagesList/MessagesList";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OneToOneChatHeader from "./components/OneToOneChatHeader/OneToOneChatHeader";
import * as SecureStore from "expo-secure-store";

import axios from "axios";
import { useSelector } from "react-redux";
import { set } from 'date-fns';

const Message = () => {
  // ------------------ States ------------------
  const [messages, setMessages] = useState([]); // Chat messages
  const [selectedMessages, setSelectedMessages] = useState([]); // Selected messages for edit/delete
  const [editingMessageId, setEditingMessageId] = useState(null); // Message being edited
  const [messageText, setMessageText] = useState(""); // Current input text
  const [isBlocked, setIsBlocked] = useState(false); // Blocked status
  const [wallpaperUri, setWallpaperUri] = useState(null); // Chat wallpaper
  const [type, setType] = useState("single"); 

  // ------------------ Navigation & Animations ------------------
  const params = useLocalSearchParams();
  // console.log("PARAMS", params);

  //  console.log("RAW DATA",params);

  // Safe parsing to avoid "Unexpected character: u"
  let user = params.user;
  const [currentChatUser, setCurrentChatUser] = useState(null);

  let me = useSelector((state) => state.auth.user);
  useEffect(() => {
    console.log("This is the uiser", user);
    
    setCurrentChatUser(user);
  }, [user]);

  try {
    if (typeof user === "string") {
      user = JSON.parse(user);
    }
  } catch (e) {
    console.warn("Failed to parse user param:", e);
  }

  // console.log("conatct Data",user);

  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  //   // ------------------ Fetch messages ------------------
  const handleGetMessage = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        Alert.alert("Error", "No send Id token found");
        return;
      }

      const response = await axios.get(
        `${process.env.EXPO_API_URL}/get/messages`,
        {
          params: { receiver_id: user.id }, // ✅ query params go here
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // console.log("dataMessage",response.data);

      if (response.data.success) {
        const messages = response.data.messages || [];
        setMessages(messages);
        setType("single");  // set chat type to single
        // setIsBlocked(response.data.isBlocked);
        // setHasLeftGroup(response.data.hasLeftGroup);
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to fetch messages"
        );
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      Alert.alert("Error", error.message || "Failed to fetch messages");
    }
  };

  // ------------------ Load Wallpaper from AsyncStorage ------------------
  useEffect(() => {
    (async () => {
      const uri = await AsyncStorage.getItem("chat_wallpaper");
      setWallpaperUri(uri || null);
    })();
  }, []);

  // ------------------ Message Selection ------------------
  const toggleMessageSelection = (id) => {
    setSelectedMessages((prev) =>
      prev.includes(id) ? prev.filter((msgId) => msgId !== id) : [...prev, id]
    );
  };

  const handleLongPress = (item) => {
    toggleMessageSelection(item.id);
  };

  useEffect(()=>{
    // console.log("This is me",me);
    // console.log("This is user",user);
    
  },[user,me])

  // ------------------ Delete Messages ------------------
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

  // ------------------ Cancel Selection ------------------
  const cancelSelection = () => {
    setSelectedMessages([]);
    setEditingMessageId(null);
    setMessageText("");
  };

  // ------------------ Edit Message /send Message ------------------
  // ✅ Send or Edit message
  const editSelectedMessage = () => {
    if (selectedMessages.length === 1) {
      const msgToEdit = messages.find((msg) => msg.id === selectedMessages[0]);
      if (msgToEdit) {
        setEditingMessageId(msgToEdit.id);
        setMessageText(msgToEdit.text);
      }
    }
  };

  // ------------------ Clear Chat ------------------
  const clearChat = () => {
    setMessages([]);
    setSelectedMessages([]);
    setEditingMessageId(null);
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

useEffect(() => {
  const fetchMessages = async () => {
    await handleGetMessage(); // load old history once
  };
  fetchMessages();

  const socket = getSocket();
  if (socket) {
    console.log("📩 Connected to socket", socket.id);

    const handleNewMessage = (msg) => {
      // console.log("📩 Received socket message:", msg);

      // Use correct property names (snake_case)
      if (
        (msg.sender_id === me.id && msg.receiver_id === user.id) ||
        (msg.sender_id === user.id && msg.receiver_id === me.id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }
}, [user.id]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
          {/* 🔹 Chat Header */}
          <OneToOneChatHeader
            onWallpaperChange={handleWallpaperChange}
            onBlock={() => setIsBlocked(true)}
            onClearChat={clearChat}
            user={user}
          />

          {/* 🔹 Blocked Contact Overlay */}
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
              {/* 🔹 Action bar for selected messages */}
              {selectedMessages.length > 0 && (
                <SelectedMessagesActionBar
                  selectedCount={selectedMessages.length}
                  onEdit={editSelectedMessage}
                  onDelete={deleteSelectedMessages}
                  onCancel={cancelSelection}
                />
              )}

              {/* 🔹 Messages List */}
              <MessagesList
              type={type}
                messages={messages}
                user={user}
                onLongPress={handleLongPress}
                selectedMessages={selectedMessages}
                fadeAnim={fadeAnim}
                flatListRef={flatListRef}
                wallpaperUri={wallpaperUri}
              />

              {/* 🔹 Message Input Bar */}
              <SendMessageBar
               type={type}
                messageText={messageText}
                setMessageText={setMessageText}
                editingMessageId={editingMessageId}
                cancelEditing={cancelSelection}
                // onSend={handleSend} // ✅ Fixed function reference
                user={user}
                handleGetMessage={handleGetMessage}
              />
            </>
          )}
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Message;

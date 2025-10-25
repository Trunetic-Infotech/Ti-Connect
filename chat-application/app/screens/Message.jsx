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
  const [isLoading, setIsLoading] = useState(false);

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
      const url = type === "single" ? "/get/messages" : "/get/group/messages";
      const response = await axios.get(`${process.env.EXPO_API_URL}${url}`, {
        params: { receiver_id: currentChatUser.id },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setMessages(response.data.messages || []);
        setType("single");
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to fetch messages"
        );
      }
    } catch (err) {
      console.error("Fetch messages error:", err);
    }
  }, [currentChatUser?.id]);

  useEffect(() => {
    fetchMessages();

    const socket = getSocket();
    if (!socket) return;

    // 🔹 Handle new incoming messages
    const handleNewMessage = async (msg) => {
      // Only consider messages between me and current chat user
      if (
        (msg.sender_id === me.id && msg.receiver_id === currentChatUser?.id) ||
        (msg.sender_id === currentChatUser?.id && msg.receiver_id === me.id)
      ) {
        setMessages((prev) => [...prev, msg]);

        // If message is from the other user, mark as delivered immediately
        if (
          msg.sender_id === currentChatUser?.id &&
          msg.receiver_id === me.id
        ) {
          console.log("in teh delivered");

          await axios
            .post(`${process.env.EXPO_API_URL}/messages/${msg.id}/delivered`)
            .catch(console.log);

          // Don't mark as read immediately here
          // Read will be marked in MessagesList via handleViewableItemsChanged
        }
      }
    };

    // 🔹 Other handlers (deleted, updated, status)
    const handleDeletedMessage = ({ messageId, sender_id, receiver_id }) => {
      if (
        (sender_id === me.id && receiver_id === currentChatUser?.id) ||
        (sender_id === currentChatUser?.id && receiver_id === me.id)
      ) {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      }
    };

    const handleUpdatedMessage = (updatedMsg) => {
      if (
        (updatedMsg.sender_id === me.id &&
          updatedMsg.receiver_id === currentChatUser?.id) ||
        (updatedMsg.sender_id === currentChatUser?.id &&
          updatedMsg.receiver_id === me.id)
      ) {
        setMessages((prev) =>
          prev.map((msg) =>
            String(msg.id) === String(updatedMsg.id)
              ? { ...msg, ...updatedMsg }
              : msg
          )
        );
      }
    };

    const handleMessageStatusUpdate = ({ message_id, status }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg.id) === String(message_id) ? { ...msg, status } : msg
        )
      );
    };

    const handleGroupNewMessage = ({ newGroupMessage }) => {
      console.log("this is the New Message in group", newGroupMessage);
      console.log(
        "------------------------------------- \nThis is the current chat user \n",
        currentChatUser
      );
      console.log(
        "------------------------------------- \nThis is the current main user \n",
        me
      );
    };

    // 🔹 Register socket listeners
    socket.on("newMessage", handleNewMessage);
    socket.on("messageDeleted", handleDeletedMessage);
    socket.on("message_updated", handleUpdatedMessage);
    socket.on("message_status_update", handleMessageStatusUpdate);
    socket.on("groupNewMessage", handleGroupNewMessage);

    // 🔹 Cleanup
    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageDeleted", handleDeletedMessage);
      socket.off("message_updated", handleUpdatedMessage);
      socket.off("message_status_update", handleMessageStatusUpdate);
      socket.on("groupNewMessage", handleGroupNewMessage);
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
  const deleteSelectedMessages = async (messageId = null) => {
    const messagesToDelete = messageId
      ? [messageId] // single message delete
      : selectedMessages; // multiple selected messages

    if (!messagesToDelete.length) return Alert.alert("No messages selected");

    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) return Alert.alert("Error", "No token found");

      Alert.alert(
        "Delete Messages",
        `Are you sure you want to delete ${messagesToDelete.length} message(s)?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              // Delete from server
              for (const id of messagesToDelete) {
                await axios.delete(
                  `${process.env.EXPO_API_URL}/messages/${id}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
              }

              // 🔥 Update local UI immediately
              setMessages((prev) =>
                prev.filter((msg) => !messagesToDelete.includes(msg.id))
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
  const editSelectedMessage = (message) => {
    setEditingMessageId(message.id); // Mark this message as being edited
    setMessageText(message.message); // Fill input with current message text
    setSelectedMessages([message.id]); // Optional: highlight the selected message
  };

  // ------------------ Send Message ------------------
const handleSend = async (media) => {
  if (media) {
    console.log("This is the media we are receiving", media);
  }
  if (!messageText.trim() && !media) return;

  try {
    setIsLoading(true);
    const token = await SecureStore.getItemAsync("token");
    if (!token) return Alert.alert("Error", "No token found");

    const API_URL = process.env.EXPO_API_URL;
    if (!API_URL) {
      console.error("❌ API URL is undefined!");
      return;
    }

    // 🟩 Editing an existing message
    if (editingMessageId && !media) {
      const response = await axios.put(
        `${API_URL}/messages/${editingMessageId}`,
        { message: messageText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === editingMessageId ? response.data.updatedMessage : msg
          )
        );
        cancelSelection();
      }
      return; // stop here
    }

    // 🟦 If sending media
    if (media && media.type !== "text") {
      // 🟨 Handle CONTACT — no upload request
      if (media.type === "contact") {
        const contactData = {
          name: media.name || "Unknown",
          phone: media.phone || "No phone",
          email: media.email || "No email",
        };

        const response = await axios.post(
          `${API_URL}/messages`,
          {
            contact_details: contactData,
            receiver_id: currentChatUser.id,
            status: "sent",
            message_type: "contact",
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setMessages((prev) => [...prev, response.data.newMessage]);
          setMessageText("");
        }
        return; // ✅ stop here — no need to upload
      }

      // 🟩 Otherwise (image/video) → upload first
      const formData = new FormData();
      if (media.type === "image") {
        formData.append("media_url", {
          uri: media.uri,
          name: `photo_${Date.now()}.jpg`,
          type: "image/jpeg",
        });
      } else if (media.type === "video") {
        formData.append("media_url", {
          uri: media.uri,
          name: `video_${Date.now()}.mp4`,
          type: "video/mp4",
        });
      }

      console.log("Uploading to:", `${API_URL}/messages/upload`);

      const res = await axios.post(`${API_URL}/messages/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Upload response:", res.data);

      if (res.data.success) {
        const result = await axios.post(
          `${API_URL}/messages`,
          {
            media_url: res.data.fileUrl,
            receiver_id: currentChatUser.id,
            status: "sent",
            message_type: media.type,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (result.data.success) {
          setMessages((prev) => [...prev, result.data.newMessage]);
          setMessageText("");
        }
      }
      return;
    }

    // 🟧 Sending plain text
    const response = await axios.post(
      `${API_URL}/messages`,
      {
        message: messageText,
        receiver_id: currentChatUser.id,
        status: "sent",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success) {
      setMessages((prev) => [...prev, response.data.newMessage]);
      setMessageText("");
    }
  } catch (err) {
    console.error("❌ Send message error:", err.message);
    if (err.response) console.log("Server response:", err.response.data);
  }finally{
    setIsLoading(false);
  }
};


  // ------------------ Clear Chat ------------------
  const clearChat = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) return Alert.alert("Error", "No token found");

      // const response = await axios.
    } catch (error) {}
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
      style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView className='flex-1 bg-slate-50' edges={["top", "bottom"]}>
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
              {type === "single" ? (
                <MessagesList
                  type={type}
                  messages={messages}
                  setMessages={setMessages}
                  user={currentChatUser}
                  me={me}
                  onLongPress={handleLongPress}
                  selectedMessages={selectedMessages}
                  fadeAnim={fadeAnim}
                  flatListRef={flatListRef}
                  wallpaperUri={wallpaperUri}
                  onDeleteMessage={deleteSelectedMessages} // For real-time delete
                  onEditMessage={editSelectedMessage} // For real-time edit
                  isLoading={isLoading}
                />
              ) : (
                <View>
                  <Text>Hello</Text>
                </View>
              )}

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

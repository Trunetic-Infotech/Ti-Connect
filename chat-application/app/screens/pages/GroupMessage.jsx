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
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios"; // ✅ API calls

import GroupChatHeader from "../components/GroupChatHeader/GroupChatHeader";
import SendMessageBar from "../components/SenderMessage/SendMessageBar";
import BlockedOverlay from "../components/BlockContact/BlockedOverlay";
import SelectedMessagesActionBar from "../components/SelectedMessagesActionBar/SelectedMessagesActionBar";
import MessagesList from "../components/MessagesList/MessagesList";

import * as SecureStore from "expo-secure-store";
import { getSocket } from "../../services/socketService";
import { useSelector } from "react-redux";

const GroupMessage = () => {
  // ------------------- STATE -------------------
  const [messages, setMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [hasLeftGroup, setHasLeftGroup] = useState(false);
  const [wallpaperUri, setWallpaperUri] = useState(null);
  const [type, setType] = useState("group"); // "single" or "group"
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const currentUserId = useSelector((state) => state.auth.user.id);

  const params = useLocalSearchParams();
  let GroupDetails = params.groupedata;

  // Parse JSON if passed as string
  try {
    if (typeof GroupDetails === "string") {
      GroupDetails = JSON.parse(GroupDetails);
    }
  } catch (e) {
    console.log("Failed to parse GroupDetails:", e);
  }

  //   // ------------------ Fetch Group messages ------------------

  const fetchGroupMessages = async () => {
    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      Alert.alert("please login again");
      return router.replace("/screens/home");
    }
    try {
      const response = await axios.get(
        `${process.env.EXPO_API_URL}/get/group/messages`,
        {
          params: { groupId: GroupDetails.id },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // console.log("GroupData", response.data);
      if (response.data.success) {
        const messages = response.data.messages.map((msg) => ({
          ...msg,
          isSender: msg.sender_id === currentUserId, // currentUserId = logged-in user's id
        }));
        setMessages(messages);
        setType("group");
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

  // ------------------- LOAD INITIAL DATA -------------------
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    (async () => {
      const uri = await SecureStore.getItem("chat_wallpaper");
      setWallpaperUri(uri || null);
    })();
  }, []);

  // Fetch messages from backend
useEffect(() => {
  const fetchMessages = async () => {
    await fetchGroupMessages();
  };
  fetchMessages();

  const socket = getSocket();

  const handleNewMessage = (msg) => {
    if (msg.groupId === GroupDetails.id) {
      setMessages((prev) => {
        if (prev.some(m => m.id === msg.id)) return prev; // avoid duplicates
        return [msg, ...prev];
      });
    }
  };

  // Join group once
  // socket.emit("joinGroup", { userId: currentUserId, groupId: GroupDetails.id });

  socket.on("groupNewMessage", handleNewMessage);

  return () => {
    socket.off("groupNewMessage", handleNewMessage);
  };
}, [currentUserId, GroupDetails.id]);


  // ------------------- FUNCTIONS -------------------
  const toggleMessageSelection = (id) => {
    setSelectedMessages((prev) =>
      prev.includes(id) ? prev.filter((msgId) => msgId !== id) : [...prev, id]
    );
  };

  const handleLongPress = (item) => toggleMessageSelection(item.id);

  const deleteSelectedMessages = async () => {
    Alert.alert(
      "Delete Messages",
      `Delete ${selectedMessages.length} message(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${process.env.EXPO_API_URL}/messages`, {
                data: { ids: selectedMessages },
              });
              setMessages((prev) =>
                prev.filter((msg) => !selectedMessages.includes(msg.id))
              );
              setSelectedMessages([]);
            } catch (err) {
              console.error("Delete failed:", err);
            }
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

  const handleSend = async (message) => {
    try {
      if (editingMessageId && message.type === "text") {
        // Update existing message
        await axios.put(
          `${process.env.EXPO_API_URL}/messages/${editingMessageId}`,
          { text: message.text }
        );
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === editingMessageId ? { ...msg, text: message.text } : msg
          )
        );
        setEditingMessageId(null);
        setMessageText("");
      } else {
        // Send new message
        const res = await axios.post(
          `${process.env.EXPO_API_URL}/groups/${GroupDetails.id}/messages`,
          message
        );
        setMessages((prev) => [res.data, ...prev]);

        setTimeout(
          () =>
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true }),
          100
        );
        if (message.type === "text") setMessageText("");
      }
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  const clearChat = async () => {
    try {
      await axios.delete(
        `${process.env.EXPO_API_URL}/groups/${GroupDetails.id}/messages`
      );
      setMessages([]);
    } catch (err) {
      console.error("Clear chat failed:", err);
    }
  };

  const handleWallpaperChange = async (uri) => {
    if (uri) {
      setWallpaperUri(uri);
      await SecureStore.setItem("chat_wallpaper", uri);
    } else {
      setWallpaperUri(null);
      await SecureStore.removeItem("chat_wallpaper");
    }
  };

  // ------------------- RENDER -------------------
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
          <GroupChatHeader
            onWallpaperChange={handleWallpaperChange}
            onBlock={() => setIsBlocked(true)}
            onClearChat={clearChat}
            GroupDetails={GroupDetails}
            onLeaveGroup={() => {
              Alert.alert("Leave Group", "Leave this group?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Leave",
                  style: "destructive",
                  onPress: () => setHasLeftGroup(true),
                },
              ]);
            }}
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
                Alert.alert("Delete Chat", "Delete this chat?", [
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
                ]);
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
                type={type}
              />

              <SendMessageBar
                messageText={messageText}
                setMessageText={setMessageText}
                editingMessageId={editingMessageId}
                cancelEditing={cancelSelection}
                onSend={handleSend}
                handleGetMessage={fetchGroupMessages}
                GroupDetails={GroupDetails}
                type={type}
              />
            </>
          )}
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default GroupMessage;

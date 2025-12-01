import axios from "axios"; // ✅ API calls
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BlockedOverlay from "../components/BlockContact/BlockedOverlay";
import GroupChatHeader from "../components/GroupChatHeader/GroupChatHeader";
import MessagesList from "../components/MessagesList/MessagesList";
import SelectedMessagesActionBar from "../components/SelectedMessagesActionBar/SelectedMessagesActionBar";
import SendMessageBar from "../components/SenderMessage/SendMessageBar";
import * as SecureStore from "expo-secure-store";
import { useSelector } from "react-redux";
import { getSocket } from "../../services/socketService";

const GroupMessage = () => {
  // ------------------- STATE -------------------
  const [messages, setMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [hasLeftGroup, setHasLeftGroup] = useState(false);
  const [wallpaperUri, setWallpaperUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState("group"); // "single" or "group"
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const currentUserId = useSelector((state) => state.auth.user.id);
  const user = useSelector((state) => state.auth.user);

  const params = useLocalSearchParams();
  let GroupDetails = params.groupedata;

  // Parse JSON if passed as string
  try {
    if (typeof GroupDetails === "string") {
      GroupDetails = JSON.parse(GroupDetails);
    }
    console.log("This is the grp data ", GroupDetails);

  } catch (e) {
    console.log("Failed to parse GroupDetails:", e);
  }

  // ------------------ Load Wallpaper ------------------
  useEffect(() => {
    (async () => {
      const uri = await AsyncStorage.getItem("chat_wallpaper");
      setWallpaperUri(uri || null);
    })();
  }, []);
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    }
  }, [messages.length]);

  // ------------------ Fetch Messages ------------------
  const fetchMessages = async () => {
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
        setIsBlocked(response.data.isBlocked);
        setHasLeftGroup(response.data.hasLeftGroup);
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

  useEffect(() => {
    fetchMessages();

    const socket = getSocket();
    if (!socket) return;

    // 🔹 Handle new incoming messages
    const handleNewMessage = async (msg) => {
      // Only consider messages between me and current chat user
      if (msg.group_id === GroupDetails.id) {
        setMessages((prev) => [...prev, msg]);

        // If message is from the other user, mark as delivered immediately
        if (
          msg.sender_id === GroupDetails?.id &&
          msg.groupId === me.id
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
    const handleDeletedMessage = ({ messageId, sender_id, groupId }) => {
      if (
        (sender_id === me.id && groupId === GroupDetails?.id) ||
        (sender_id === GroupDetails?.id && groupId === me.id)
      ) {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      }
    };

    const handleUpdatedMessage = (updatedMsg) => {
      if (
        (updatedMsg.sender_id === me.id &&
          updatedMsg.groupId === GroupDetails?.id)
        //  || (updatedMsg.sender_id === GroupDetails?.id &&
        // updatedMsg.groupId === me.id)
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

    // const handleGroupNewMessage = ({ newGroupMessage }) => {
    //    console.log("this is the New Message in group", newGroupMessage);
    //   // console.log(
    //   //   "------------------------------------- \nThis is the current chat user \n",
    //   //   GroupDetails
    //   // );
    //   // console.log(
    //   //   "------------------------------------- \nThis is the current main user \n",
    //   //   me
    //   // );
    // };

    const handleGroupNewMessage = (data) => {
      const msg = data.newGroupMessage || data;
      if (msg.group_id === GroupDetails.id) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [{
            ...msg,
            isSender: msg.sender_id === currentUserId
          }, ...prev];
        });
      }
    };


    // 🔹 Register socket listeners
    // socket.on("groupNewMessage", handleNewMessage);
    socket.on("groupMessageDeleted", handleDeletedMessage);
    socket.on("message_updated", handleUpdatedMessage);
    socket.on("message_status_update", handleMessageStatusUpdate);
    socket.on("groupNewMessage", handleGroupNewMessage);

    // 🔹 Cleanup
    return () => {
      // socket.off("groupNewMessage", handleNewMessage);
      socket.off("groupMessageDeleted", handleDeletedMessage);
      socket.off("message_updated", handleUpdatedMessage);
      socket.off("message_status_update", handleMessageStatusUpdate);
      // socket.on("groupNewMessage", handleGroupNewMessage);
    };
  }, [currentUserId, GroupDetails?.id]);
  // ------------------- SELECTION -------------------
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
            `${API_URL}/groups/send/messages`,
            {
              contact_details: contactData,
              groupId: GroupDetails.id,
              status: "sent",
              message_type: "contact",
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.data.success) {
            setMessages((prev) => [response.data.newMessage, ...prev]);
            setMessageText("");
          }
          return; // ✅ stop here — no need to upload
        }

        // 🟩 Otherwise (image/video) → upload first
        const formData = new FormData();
        formData.append("groupId", GroupDetails.id);
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
        } else if (media.type === "audio") {
          formData.append("media_url", {
            uri: media.uri,
            name: `audio_${Date.now()}.mp3`,
            type: "audio/mpeg",
          });
        } else if (media.type === "document") {
          formData.append("media_url", {
            uri: media.uri,
            name: `document_${Date.now()}.pdf`,
            type: "application/pdf",
          });
        }

        console.log("Uploading to:", `${API_URL}/groups/send/messages/upload`);

        const res = await axios.post(`${API_URL}/groups/send/messages/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Upload response:", res.data);

        if (res.data.success) {
          // Server already created the message and emitted via socket
          // So we just clear the input
          setMessageText("");

          // Optional fallback: if socket hasn't fired yet, add from response
          if (res.data.newMessage) {
            setMessages(prev => {
              // Avoid duplicate
              if (prev.some(m => m.id === res.data.newMessage.id)) return prev;
              return [{
                ...res.data.newMessage,
                isSender: true
              }, ...prev];
            });
          }
        }
        return;
      }

      // 🟧 Sending plain text
      const response = await axios.post(
        `${API_URL}/groups/send/messages`,
        {
          message: messageText,
          groupId: GroupDetails.id,
          status: "sent",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessages((prev) => [response.data.newMessage, ...prev]);
        setMessageText("");
      }
    } catch (err) {
      console.error("❌ Send message error:", err.message);
      if (err.response) console.log("Server response:", err.response.data);
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------ Clear Chat ------------------
  const clearChat = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) return Alert.alert("Error", "No token found");

      // const response = await axios.
    } catch (error) { }
    setMessages([]);
    cancelSelection();
  };

  // ------------------ Change Wallpaper ------------------
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);
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

          {/* Blocked Overlay */}
          {
            hasLeftGroup ? (
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
                {type === "group" ? (
                  <MessagesList
                    type={type}
                    messages={messages}
                    setMessages={setMessages}
                    user={user}
                    GroupDetails={GroupDetails}
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
                  user={user}
                  handleGetMessage={fetchMessages}
                  GroupDetails={GroupDetails}
                />
              </>
            )}
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};


export default GroupMessage;

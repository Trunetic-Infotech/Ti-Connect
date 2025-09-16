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

import dp from "../../assets/images/dp.jpg";

import SendMessageBar from "../screens/components/SenderMessage/SendMessageBar";
import BlockedOverlay from "../screens/components/BlockContact/BlockedOverlay";
import SelectedMessagesActionBar from "../screens/components/SelectedMessagesActionBar/SelectedMessagesActionBar";
import MessagesList from "../screens/components/MessagesList/MessagesList";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OneToOneChatHeader from "./components/OneToOneChatHeader/OneToOneChatHeader";
import * as SecureStore from "expo-secure-store";

import axios from "axios";

const Message = () => {
  // ------------------ States ------------------
  const [messages, setMessages] = useState([]); // Chat messages
  const [selectedMessages, setSelectedMessages] = useState([]); // Selected messages for edit/delete
  const [editingMessageId, setEditingMessageId] = useState(null); // Message being edited
  const [messageText, setMessageText] = useState(""); // Current input text
  const [isBlocked, setIsBlocked] = useState(false); // Blocked status
  const [wallpaperUri, setWallpaperUri] = useState(null); // Chat wallpaper

  // ------------------ Navigation & Animations ------------------
  const params = useLocalSearchParams();
  //  console.log("RAW DATA",params);
   
  // const user = JSON.parse(params.user); // Passed user object
  // Safe parsing to avoid "Unexpected character: u"
let user = params.user;

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
        headers: { Authorization: `Bearer ${token}` }
      }
      );
      // console.log("dataMessage",response.data);
      
      if (response.data.success) {
const messages = response.data.messages || [];
      setMessages(messages);
} else {
        Alert.alert("Error", response.data.message || "Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      Alert.alert("Error", "Something went wrong while fetching messages");
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
  let interval;

  const fetchMessages = async () => {
    await handleGetMessage();
  };

  // First fetch
  fetchMessages();

  // Poll every 5 seconds
  interval = setInterval(fetchMessages, 5000);

  // Cleanup when component unmounts
  return () => clearInterval(interval);
}, []);


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
                messageText={messageText}
                setMessageText={setMessageText}
                editingMessageId={editingMessageId}
                cancelEditing={cancelSelection}
                // onSend={handleSend} // ✅ Fixed function reference
                user={user}

              />
            </>
          )}
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Message;
// *****************************************************************************************************************


// import React, { useState, useRef, useEffect } from "react";
// import {
//   View,
//   Text,
//   KeyboardAvoidingView,
//   Platform,
//   TouchableWithoutFeedback,
//   Keyboard,
//   Animated,
//   Alert,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useRouter, useLocalSearchParams } from "expo-router";

// import dp from "../../assets/images/dp.jpg";

// import SendMessageBar from "../screens/components/SenderMessage/SendMessageBar";
// import BlockedOverlay from "../screens/components/BlockContact/BlockedOverlay";
// import SelectedMessagesActionBar from "../screens/components/SelectedMessagesActionBar/SelectedMessagesActionBar";
// import MessagesList from "../screens/components/MessagesList/MessagesList";
// import OneToOneChatHeader from "./components/OneToOneChatHeader/OneToOneChatHeader";
// import * as SecureStore from "expo-secure-store";

// import axios from "axios";

// const Message = () => {
//   // ------------------ States ------------------
//   const [messages, setMessages] = useState([]);
//   const [selectedMessages, setSelectedMessages] = useState([]);
//   const [editingMessageId, setEditingMessageId] = useState(null);
//   const [messageText, setMessageText] = useState("");
//   const [isBlocked, setIsBlocked] = useState(false);
//   const [wallpaperUri, setWallpaperUri] = useState(null);

//   // ------------------ Navigation & Animations ------------------
//  const params = useLocalSearchParams();
//  const user = JSON.parse(params.user); // Passed user object // ✅ No JSON.parse crash
//   const router = useRouter();
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const flatListRef = useRef(null);

//   // ------------------ Fetch messages ------------------
//   const handleGetMessage = async () => {
//     try {
//       const token = await SecureStore.getItemAsync("authToken");
//       if (!token) {
//         Alert.alert("Error", "No auth token found");
//         return;
//       }

//       const response = await axios.post(
//          `${process.env.EXPO_API_URL}/get/messages`,
//         { receiver_id: id }, // ✅ use id directly
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (response.data.success) {
//         setMessages(response.data.data);
//       } else {
//         Alert.alert("Error", response.data.message || "Failed to fetch messages");
//       }
//     } catch (error) {
//       console.error("Error fetching messages:", error);
//       Alert.alert("Error", "Something went wrong while fetching messages");
//     }
//   };

//   useEffect(() => {
//     handleGetMessage();
//   }, []);

//   // ------------------ Helpers ------------------
//   const cancelSelection = () => {
//     setSelectedMessages([]);
//     setEditingMessageId(null);
//     setMessageText("");
//   };

//   const handleSend = async (text) => {
//     try {
//       const token = await SecureStore.getItemAsync("authToken");
//       if (!token) {
//         Alert.alert("Error", "No auth token found");
//         return;
//       }

//       const response = await axios.post(
//         "http://192.168.29.180:8000/api/sendmessage",
//         { receiver_id: id, message: text },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (response.data.success) {
//         setMessages((prev) => [...prev, response.data.data]);
//         setMessageText("");
//       } else {
//         Alert.alert("Error", response.data.message || "Failed to send message");
//       }
//     } catch (error) {
//       console.error("Error sending message:", error);
//       Alert.alert("Error", "Something went wrong while sending message");
//     }
//   };

//   // ------------------ UI ------------------
//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
//       {/* Header */}
//       <OneToOneChatHeader user={user} onBack={() => router.back()} />

//       {/* Messages list */}
//       <MessagesList
//         messages={messages}
//         selectedMessages={selectedMessages}
//         setSelectedMessages={setSelectedMessages}
//         flatListRef={flatListRef}
//         wallpaperUri={wallpaperUri}
//       />

//       {/* Selected messages actions */}
//       {selectedMessages.length > 0 && (
//         <SelectedMessagesActionBar
//           selectedMessages={selectedMessages}
//           cancelSelection={cancelSelection}
//         />
//       )}

//       {/* Block overlay */}
//       {isBlocked && <BlockedOverlay />}

//       {/* Message input */}
//       {!isBlocked && selectedMessages.length === 0 && (
//         <SendMessageBar
//           messageText={messageText}
//           setMessageText={setMessageText}
//           editingMessageId={editingMessageId}
//           cancelEditing={cancelSelection}
//           onSend={handleSend}
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// export default Message;



// // import axios from "axios"; // ✅ API calls
// // import { useLocalSearchParams, useRouter } from "expo-router";
// // import { useEffect, useRef, useState } from "react";
// // import {
// //   Alert,
// //   Animated,
// //   Keyboard,
// //   KeyboardAvoidingView,
// //   Platform,
// //   Text,
// //   TouchableOpacity,
// //   TouchableWithoutFeedback,
// //   View,
// // } from "react-native";
// // import { SafeAreaView } from "react-native-safe-area-context";

// // import BlockedOverlay from "../components/BlockContact/BlockedOverlay";
// // import GroupChatHeader from "../components/GroupChatHeader/GroupChatHeader";
// // import MessagesList from "../components/MessagesList/MessagesList";
// // import SelectedMessagesActionBar from "../components/SelectedMessagesActionBar/SelectedMessagesActionBar";
// // import SendMessageBar from "../components/SenderMessage/SendMessageBar";

// // import * as SecureStore from "expo-secure-store";
// // import { useSelector } from "react-redux";
// // import { getSocket } from "../../services/socketService";

// // const GroupMessage = () => {
// //   // ------------------- STATE -------------------
// //   const [messages, setMessages] = useState([]);
// //   const [selectedMessages, setSelectedMessages] = useState([]);
// //   const [editingMessageId, setEditingMessageId] = useState(null);
// //   const [messageText, setMessageText] = useState("");
// //   const [isBlocked, setIsBlocked] = useState(false);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [hasLeftGroup, setHasLeftGroup] = useState(false);
// //   const [wallpaperUri, setWallpaperUri] = useState(null);
// //   const [type, setType] = useState("group"); // "single" or "group"
// //   const router = useRouter();
// //   const fadeAnim = useRef(new Animated.Value(0)).current;
// //   const flatListRef = useRef(null);

// //   const currentUserId = useSelector((state) => state.auth.user.id);
// //   const user = useSelector((state) => state.auth.user);

// //   const params = useLocalSearchParams();
// //   let GroupDetails = params.groupedata;

// //   // Parse JSON if passed as string
// //   try {
// //     if (typeof GroupDetails === "string") {
// //       GroupDetails = JSON.parse(GroupDetails);
// //     }
// //     console.log("This is the grp data ", GroupDetails);
// //   } catch (e) {
// //     console.log("Failed to parse GroupDetails:", e);
// //   }

// //   //   // ------------------ Fetch Group messages ------------------

// //   const fetchGroupMessages = async () => {
// //     const token = await SecureStore.getItemAsync("token");
// //     if (!token) {
// //       Alert.alert("please login again");
// //       return router.replace("/screens/home");
// //     }
// //     try {
// //       const response = await axios.get(
// //         `${process.env.EXPO_API_URL}/get/group/messages`,
// //         {
// //           params: { groupId: GroupDetails.id },
// //           headers: { Authorization: `Bearer ${token}` },
// //         }
// //       );

// //       // console.log("-----------------------------------------", response);

// //       console.log(
// //         "GroupData -----------------------------------------",
// //         response.data
// //       );
// //       if (response.data.success) {
// //         const messages = response.data.messages.map((msg) => ({
// //           ...msg,
// //           isSender: msg.sender_id === currentUserId, // currentUserId = logged-in user's id
// //         }));
// //         setMessages(messages);
// //         setType("group");
// //         // setIsBlocked(response.data.isBlocked);
// //         // setHasLeftGroup(response.data.hasLeftGroup);
// //       } else {
// //         Alert.alert(
// //           "Error",
// //           response.data.message || "Failed to fetch messages"
// //         );
// //       }
// //     } catch (error) {
// //       console.error("Error fetching messages:", error);
// //       Alert.alert("Error", error.message || "Failed to fetch messages");
// //     }
// //   };

// //   // ------------------- LOAD INITIAL DATA -------------------
// //   useEffect(() => {
// //     Animated.timing(fadeAnim, {
// //       toValue: 1,
// //       duration: 300,
// //       useNativeDriver: true,
// //     }).start();
// //   }, []);

// //   useEffect(() => {
// //     (async () => {
// //       const uri = await SecureStore.getItem("chat_wallpaper");
// //       setWallpaperUri(uri || null);
// //     })();
// //   }, []);

// //   // Fetch messages from backend
// //   useEffect(() => {
// //     const fetchMessages = async () => {
// //       await fetchGroupMessages();
// //     };
// //     fetchMessages();

// //     const socket = getSocket();

// //     const handleNewMessage = (msg) => {
// //       console.log("This is the new msg from group", msg);

// //       if (msg.group_id === GroupDetails.id) {
// //         setMessages((prev) => [...prev, msg]);
// //       }
// //     };

// //     // Join group once
// //     // socket.emit("joinGroup", { userId: currentUserId, groupId: GroupDetails.id });

// //     socket.on("groupNewMessage", handleNewMessage);
// //     socket.on("DeleteGroupMessage", deleteSelectedMessages);
// //     socket.on("GroupMessageUpdated", handleSend);

// //     return () => {
// //       socket.off("groupNewMessage", handleNewMessage);
// //       socket.off("DeleteGroupMessage", deleteSelectedMessages);
// //       socket.off("GroupMessageUpdated", handleSend);
// //     };
// //   }, [currentUserId, GroupDetails.id]);

// //   // ------------------- FUNCTIONS -------------------
// //   const toggleMessageSelection = (id) => {
// //     setSelectedMessages((prev) =>
// //       prev.includes(id) ? prev.filter((msgId) => msgId !== id) : [...prev, id]
// //     );
// //   };

// //   const handleLongPress = (item) => toggleMessageSelection(item.id);

// //   const deleteSelectedMessages = async (id) => {
// //     const token = await SecureStore.getItemAsync("token");
// //     if (!token) return Alert.alert("Error", "No token found");
// //     Alert.alert(
// //       "Delete Messages",
// //       `Delete ${selectedMessages.length} message(s)?`,
// //       [
// //         { text: "Cancel", style: "cancel" },
// //         {
// //           text: "Delete",
// //           style: "destructive",
// //           onPress: async () => {
// //             try {
// //               console.log(token);

// //               await axios.delete(
// //                 `${process.env.EXPO_API_URL}/groups/messages`,
// //                 {
// //                   data: { id, groupId: GroupDetails.id }, // 👈 body payload must be under 'data'
// //                   headers: { Authorization: `Bearer ${token}` }, // 👈 header goes here
// //                 }
// //               );

// //               setMessages((prev) =>
// //                 prev.filter((msg) => !selectedMessages.includes(msg.id))
// //               );
// //               setSelectedMessages([]);
// //             } catch (err) {
// //               console.error("Delete failed:", err);
// //             }
// //           },
// //         },
// //       ]
// //     );
// //   };

// //   const cancelSelection = () => {
// //     setSelectedMessages([]);
// //     setEditingMessageId(null);
// //     setMessageText("");
// //   };

// //   const editSelectedMessage = () => {
// //     if (selectedMessages.length === 1) {
// //       const msgToEdit = messages.find((msg) => msg.id === selectedMessages[0]);
// //       if (msgToEdit) {
// //         setEditingMessageId(msgToEdit.id);
// //         setMessageText(msgToEdit.text);
// //         setSelectedMessages([]);
// //       }
// //     }
// //   };

// //   const handleSend = async (message) => {
// //     try {
// //       const token = await SecureStore.getItemAsync("token");
// //       if (!token) return Alert.alert("Error", "No token found");

// //       let res;

// //       // 🟩 Editing existing text message
// //       if (editingMessageId && message.type === "text") {
// //         res = await axios.put(
// //           `${process.env.EXPO_API_URL}/messages/${editingMessageId}`,
// //           { text: message.text },
// //           { headers: { Authorization: `Bearer ${token}` } }
// //         );

// //         if (res.data.success) {
// //           setMessages((prev) =>
// //             prev.map((msg) =>
// //               msg.id === editingMessageId
// //                 ? { ...msg, text: message.text, isEdited: true }
// //                 : msg
// //             )
// //           );
// //         }

// //         setEditingMessageId(null);
// //         setMessageText("");
// //         return;
// //       }

// //       // 🟨 Sending new message (text or media)
// //       const API_URL =
// //         message.type !== "text"
// //           ? "/groups/send/messages/upload"
// //           : "/groups/send/messages";

// //       // 🧾 Prepare data
// //       if (message.type === "text") {
// //         // 🔹 Send plain text
// //         res = await axios.post(
// //           `${process.env.EXPO_API_URL}${API_URL}`,
// //           {
// //             message: message.text,
// //             groupId: GroupDetails.id,
// //             contact_details: contactData || null,
// //           },
// //           {
// //             headers: {
// //               "Content-Type": "application/json",
// //               Authorization: `Bearer ${token}`,
// //             },
// //           }
// //         );
// //       } else {
// //         // 🔹 Send image or video
// //         const formData = new FormData();
// //         if (message.type === "image") {
// //           formData.append("media_url", {
// //             uri: message.uri,
// //             name: `photo_${Date.now()}.jpg`,
// //             type: "image/jpeg",
// //           });
// //         } else if (message.type === "video") {
// //           formData.append("media_url", {
// //             uri: message.uri,
// //             name: `video_${Date.now()}.mp4`,
// //             type: "video/mp4",
// //           });
// //         } else if (message.type === "audio") {
// //           formData.append("media_url", {
// //             uri: message.uri,
// //             name: `audio_${Date.now()}.mp3`,
// //             type: "audio/mpeg",
// //           });
// //         } else if (message.type === "document") {
// //           formData.append("media_url", {
// //             uri: message.uri,
// //             name: `document_${Date.now()}.pdf`,
// //             type: "application/pdf",
// //           });
// //         } else if (message.type === "contact") {
// //           const contactData = {
// //             name: message.name || "Unknown",
// //             phone: message.phone || "No phone",
// //             email: message.email || "No email",
// //           };
// //         }
// //         formData.append("groupId", String(GroupDetails.id));

// //         res = await axios.post(
// //           `${process.env.EXPO_API_URL}${API_URL}`,
// //           formData,
// //           {
// //             headers: {
// //               "Content-Type": "multipart/form-data",
// //               Accept: "application/json",
// //               Authorization: `Bearer ${token}`,
// //             },
// //           }
// //         );
// //       }

// //       // ✅ Update UI instantly
// //       if (res?.data?.newGroupMessage) {
// //         setMessages((prev) => [...prev, res.data.newGroupMessage]);
// //         setTimeout(() => {
// //           flatListRef.current?.scrollToEnd({ animated: true });
// //         }, 100);
// //       }

// //       if (message.type === "text") setMessageText("");
// //     } catch (err) {
// //       console.error("❌ Send failed:", err.response?.data || err.message);
// //       Alert.alert("Error", "Failed to send message");
// //     }
// //   };

// //   const clearChat = async () => {
// //     try {
// //       await axios.delete(
// //         `${process.env.EXPO_API_URL}/groups/${GroupDetails.id}/messages`
// //       );
// //       setMessages([]);
// //     } catch (err) {
// //       console.error("Clear chat failed:", err);
// //     }
// //   };

// //   const handleWallpaperChange = async (uri) => {
// //     if (uri) {
// //       setWallpaperUri(uri);
// //       await SecureStore.setItem("chat_wallpaper", uri);
// //     } else {
// //       setWallpaperUri(null);
// //       await SecureStore.removeItem("chat_wallpaper");
// //     }
// //   };

// //   // ------------------- RENDER -------------------
// //   return (
// //     <KeyboardAvoidingView
// //       behavior={Platform.OS === "ios" ? "padding" : "height"}
// //       style={{ flex: 1 }}
// //     >
// //       <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
// //         <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
// //           <GroupChatHeader
// //             onWallpaperChange={handleWallpaperChange}
// //             onBlock={() => setIsBlocked(true)}
// //             onClearChat={clearChat}
// //             GroupDetails={GroupDetails}
// //             onLeaveGroup={() => {
// //               Alert.alert("Leave Group", "Leave this group?", [
// //                 { text: "Cancel", style: "cancel" },
// //                 {
// //                   text: "Leave",
// //                   style: "destructive",
// //                   onPress: () => setHasLeftGroup(true),
// //                 },
// //               ]);
// //             }}
// //           />

// //           {hasLeftGroup ? (
// //             <View className="flex-1 justify-center items-center px-4">
// //               <Text className="text-center text-gray-600 text-lg">
// //                 You have left this group. You cannot send or receive messages.
// //               </Text>
// //               <TouchableOpacity
// //                 onPress={() => router.back()}
// //                 className="mt-4 px-5 py-2 bg-indigo-600 rounded-full"
// //               >
// //                 <Text className="text-white font-semibold text-center">
// //                   Back to Groups
// //                 </Text>
// //               </TouchableOpacity>
// //             </View>
// //           ) : isBlocked ? (
// //             <BlockedOverlay
// //               onUnblock={() => setIsBlocked(false)}
// //               onDelete={() => {
// //                 Alert.alert("Delete Chat", "Delete this chat?", [
// //                   { text: "Cancel", style: "cancel" },
// //                   {
// //                     text: "Delete",
// //                     style: "destructive",
// //                     onPress: () => {
// //                       setMessages([]);
// //                       setIsBlocked(false);
// //                       router.back();
// //                     },
// //                   },
// //                 ]);
// //               }}
// //             />
// //           ) : (
// //             <>
// //               {selectedMessages.length > 0 && (
// //                 <SelectedMessagesActionBar
// //                   selectedCount={selectedMessages.length}
// //                   onEdit={editSelectedMessage}
// //                   onDelete={deleteSelectedMessages}
// //                   onCancel={cancelSelection}
// //                 />
// //               )}

// //               <MessagesList
// //                 messages={messages}
// //                 onLongPress={handleLongPress}
// //                 selectedMessages={selectedMessages}
// //                 fadeAnim={fadeAnim}
// //                 flatListRef={flatListRef}
// //                 wallpaperUri={wallpaperUri}
// //                 type={type}
// //                 user={user}
// //                 setMessages={setMessages}
// //                 onDeleteMessage={deleteSelectedMessages}
// //                 onEditMessage={editSelectedMessage}
// //                 isLoading={isLoading}
// //                 GroupDetails={GroupDetails}
// //                 handleGetMessage={fetchGroupMessages}
// //               />

// //               <SendMessageBar
// //                 messageText={messageText}
// //                 setMessageText={setMessageText}
// //                 editingMessageId={editingMessageId}
// //                 cancelEditing={cancelSelection}
// //                 onSend={handleSend}
// //                 handleGetMessage={fetchGroupMessages}
// //                 GroupDetails={GroupDetails}
// //                 type={type}
// //               />
// //             </>
// //           )}
// //         </SafeAreaView>
// //       </TouchableWithoutFeedback>
// //     </KeyboardAvoidingView>
// //   );
// // };

// // export default GroupMessage;




// import axios from "axios"; // ✅ API calls
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { useEffect, useRef, useState } from "react";
// import {
//   Alert,
//   Animated,
//   Keyboard,
//   KeyboardAvoidingView,
//   Platform,
//   Text,
//   TouchableOpacity,
//   TouchableWithoutFeedback,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// import BlockedOverlay from "../components/BlockContact/BlockedOverlay";
// import GroupChatHeader from "../components/GroupChatHeader/GroupChatHeader";
// import MessagesList from "../components/MessagesList/MessagesList";
// import SelectedMessagesActionBar from "../components/SelectedMessagesActionBar/SelectedMessagesActionBar";
// import SendMessageBar from "../components/SenderMessage/SendMessageBar";

// import * as SecureStore from "expo-secure-store";
// import { useSelector } from "react-redux";
// import { getSocket } from "../../services/socketService";

// const GroupMessage = () => {
//   // ------------------- STATE -------------------
//   const [messages, setMessages] = useState([]);
//   const [selectedMessages, setSelectedMessages] = useState([]);
//   const [editingMessageId, setEditingMessageId] = useState(null);
//   const [messageText, setMessageText] = useState("");
//   const [isBlocked, setIsBlocked] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [hasLeftGroup, setHasLeftGroup] = useState(false);
//   const [wallpaperUri, setWallpaperUri] = useState(null);
//   const [type, setType] = useState("group"); // "single" or "group"
//   const router = useRouter();
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const flatListRef = useRef(null);

//   const currentUserId = useSelector((state) => state.auth.user.id);
//   const user = useSelector((state) => state.auth.user);

//   const params = useLocalSearchParams();
//   let GroupDetails = params.groupedata;

//   // Parse JSON if passed as string
//   try {
//     if (typeof GroupDetails === "string") {
//       GroupDetails = JSON.parse(GroupDetails);
//     }
//     console.log("This is the grp data ", GroupDetails);
//   } catch (e) {
//     console.log("Failed to parse GroupDetails:", e);
//   }

//   //   // ------------------ Fetch Group messages ------------------

//   const fetchGroupMessages = async () => {
//     const token = await SecureStore.getItemAsync("token");
//     if (!token) {
//       Alert.alert("please login again");
//       return router.replace("/screens/home");
//     }
//     try {
//       const response = await axios.get(
//         `${process.env.EXPO_API_URL}/get/group/messages`,
//         {
//           params: { groupId: GroupDetails.id },
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       // console.log("-----------------------------------------", response);

//       console.log(
//         "GroupData -----------------------------------------",
//         response.data
//       );
//       if (response.data.success) {
//         const messages = response.data.messages.map((msg) => ({
//           ...msg,
//           isSender: msg.sender_id === currentUserId, // currentUserId = logged-in user's id
//         }));
//         setMessages(messages);
//         setType("group");
//         // setIsBlocked(response.data.isBlocked);
//         // setHasLeftGroup(response.data.hasLeftGroup);
//       } else {
//         Alert.alert(
//           "Error",
//           response.data.message || "Failed to fetch messages"
//         );
//       }
//     } catch (error) {
//       console.error("Error fetching messages:", error);
//       Alert.alert("Error", error.message || "Failed to fetch messages");
//     }
//   };

//   // ------------------- LOAD INITIAL DATA -------------------
//   useEffect(() => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 300,
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   useEffect(() => {
//     (async () => {
//       const uri = await SecureStore.getItem("chat_wallpaper");
//       setWallpaperUri(uri || null);
//     })();
//   }, []);

//   // Fetch messages from backend
//   useEffect(() => {
//     if (!GroupDetails) return;
//     fetchGroupMessages();

//     const socket = getSocket();

//     const handleNewMessage = async (msg) => {
//       // Only consider messages between me and current chat Group

//       if (msg.group_id === GroupDetails.id) {
//         setMessages((prev) => [...prev, msg]);
//       }

//        // If message is from the other user, mark as delivered immediately
//         if (
//           msg.sender_id === GroupDetails?.id &&
//           msg.GroupDetails === me.id
//         ) {
//           console.log("in teh delivered");

//           await axios
//             .post(`${process.env.EXPO_API_URL}/messages/${msg.id}/delivered`)
//             .catch(console.log);

//           // Don't mark as read immediately here
//           // Read will be marked in MessagesList via handleViewableItemsChanged
//         }
//       }
    
//   const handleDeletedMessage = ({ messageId, sender_id, groupId }) => {
//       if (
//         (sender_id === me.id && groupId === GroupDetails?.id) ||
//         (sender_id === GroupDetails?.id && groupId === me.id)
//       ) {
//         setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
//       }
//     };


//       const handleUpdatedMessage = (updatedMsg) => {
//       if (
//         (updatedMsg.sender_id === me.id &&
//           updatedMsg.groupId === GroupDetails?.id) ||
//         (updatedMsg.sender_id === GroupDetails?.id &&
//           updatedMsg.groupId === me.id)
//       ) {
//         setMessages((prev) =>
//           prev.map((msg) =>
//             String(msg.id) === String(updatedMsg.id)
//               ? { ...msg, ...updatedMsg }
//               : msg
//           )
//         );
//       }
//     };


//     const handleMessageStatusUpdate = ({ message_id, status }) => {
//       setMessages((prev) =>
//         prev.map((msg) =>
//           String(msg.id) === String(message_id) ? { ...msg, status } : msg
//         )
//       );
//     };

//     // Join group once
//     // socket.emit("joinGroup", { userId: currentUserId, groupId: GroupDetails.id });

//     socket.on("groupNewMessage", handleNewMessage);
//     socket.on("DeleteGroupMessage", handleDeletedMessage);
//     socket.on("GroupMessageUpdated", handleUpdatedMessage);
//      socket.on("message_status_update", handleMessageStatusUpdate);

//     return () => {
//       socket.off("groupNewMessage", handleNewMessage);
//       socket.off("message_status_update", handleMessageStatusUpdate);
//       socket.off("DeleteGroupMessage", handleDeletedMessage);
//       socket.off("GroupMessageUpdated", handleUpdatedMessage);
//     };
//   }, [currentUserId, GroupDetails.id]);

//   // ------------------- FUNCTIONS -------------------
//   const toggleMessageSelection = (id) => {
//     setSelectedMessages((prev) =>
//       prev.includes(id) ? prev.filter((msgId) => msgId !== id) : [...prev, id]
//     );
//   };

//   const handleLongPress = (item) => toggleMessageSelection(item.id);

//   const deleteSelectedMessages = async (id) => {
//     const token = await SecureStore.getItemAsync("token");
//     if (!token) return Alert.alert("Error", "No token found");
//     Alert.alert(
//       "Delete Messages",
//       `Delete ${selectedMessages.length} message(s)?`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               console.log(token);

//               await axios.delete(
//                 `${process.env.EXPO_API_URL}/groups/messages`,
//                 {
//                   data: { id, groupId: GroupDetails.id }, // 👈 body payload must be under 'data'
//                   headers: { Authorization: `Bearer ${token}` }, // 👈 header goes here
//                 }
//               );

//               setMessages((prev) =>
//                 prev.filter((msg) => !selectedMessages.includes(msg.id))
//               );
//               setSelectedMessages([]);
//             } catch (err) {
//               console.error("Delete failed:", err);
//             }
//           },
//         },
//       ]
//     );
//   };

//   const cancelSelection = () => {
//     setSelectedMessages([]);
//     setEditingMessageId(null);
//     setMessageText("");
//   };

//   const editSelectedMessage = () => {
//     if (selectedMessages.length === 1) {
//       const msgToEdit = messages.find((msg) => msg.id === selectedMessages[0]);
//       if (msgToEdit) {
//         setEditingMessageId(msgToEdit.id);
//         setMessageText(msgToEdit.text);
//         setSelectedMessages([msgToEdit.id]);
//       }
//     }
//   };

// const handleSend = async (message) => {
//   try {
//     const token = await SecureStore.getItemAsync("token");
//     if (!token) return Alert.alert("Error", "No token found");

//     if (!messageText.trim() && !message) return;
//     let res;

//     // 🟩 Editing existing text message
//     try {
//       setIsLoading(true);
//       const token = await SecureStore.getItemAsync("token");
//       if (!token) return Alert.alert("Error", "No token found");

//       res = await axios.put(
//         `${process.env.EXPO_API_URL}/messages/${editingMessageId}`,
//         { text: message.text },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (res.data.success) {
//         setMessages((prev) =>
//           prev.map((msg) =>
//             msg.id === editingMessageId
//               ? { ...msg, text: message.text, isEdited: true }
//               : msg
//           )
//         );
//         cancelSelection();
//       }
//       return; // stop here
//     } catch (error) {
//       console.error("Error editing message:", error);
//     }

//     if (editingMessageId && message.type === "text") {
//       if (message.type === "contact") {
//         const contactData = {
//           name: message.name || "Unknown",
//           phone: message.phone || "No phone",
//           email: message.email || "No email",
//         };

//         const response = await axios.post(
//           `${API_URL}/groups/send/messages`,
//           {
//             contact_details: contactData,
//             groupId: GroupDetails.id,
//              message_type: message.type,
//           },
//           { headers: { Authorization: `Bearer ${token}` } }
//         );

//         if (response.data.success) {
//           setMessages((prev) => [...prev, response.data.newMessage]);
//           setMessageText("");
//         }
//         return; // ✅ stop here — no need to upload
//       }

//       // 🟨 Sending new message (text or media)
//       const API_URL =
//         message.type !== "text"
//           ? "/groups/send/messages/upload"
//           : "/groups/send/messages";

//       // 🧾 Prepare data
//       if (message.type === "text") {
//         // 🔹 Send plain text
//         const res = await axios.post(
//           `${process.env.EXPO_API_URL}${API_URL}`,
//           {
//             message: message.text, 
//             groupId: GroupDetails.id,
//             message_type: message.type,
//           },
//           {
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         if (res.data.success) {
//           setMessages((prev) => [...prev, res.data.newMessage]);
//           setMessageText("");
//         }
//       } else {
//         // 🔹 Send image or video
//         const formData = new FormData();
//         if (message.type === "image") {
//           formData.append("media_url", {
//             uri: message.uri,
//             name: `photo_${Date.now()}.jpg`,
//             type: "image/jpeg",
//           });
//         } else if (message.type === "video") {
//           formData.append("media_url", {
//             uri: message.uri,
//             name: `video_${Date.now()}.mp4`,
//             type: "video/mp4",
//           });
//         } else if (message.type === "audio") {
//           formData.append("media_url", {
//             uri: message.uri,
//             name: `audio_${Date.now()}.mp3`,
//             type: "audio/mpeg",
//           });
//         } else if (message.type === "document") {
//           formData.append("media_url", {
//             uri: message.uri,
//             name: `document_${Date.now()}.pdf`,
//             type: "application/pdf",
//           });
//         }
//         formData.append("groupId", String(GroupDetails.id));

//         res = await axios.post(
//           `${process.env.EXPO_API_URL}${API_URL}`,
//           formData,
//           {
//             headers: {
//               "Content-Type": "multipart/form-data",
//               Accept: "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//       }

//       // ✅ Update UI instantly
//       if (res?.data?.newGroupMessage) {
//         setMessages((prev) => [...prev, res.data.newGroupMessage]);
//         setTimeout(() => {
//           flatListRef.current?.scrollToEnd({ animated: true });
//         }, 100);
//       }

//       if (message.type === "text") setMessageText("");
//     }
//   } catch (err) {
//     console.error("❌ Send failed:", err.response?.data || err.message);
//     Alert.alert("Error", "Failed to send message");
//   } finally {
//     setIsLoading(false);
//   }
// };



//   const clearChat = async () => {
//     try {
//       await axios.delete(
//         `${process.env.EXPO_API_URL}/groups/${GroupDetails.id}/messages`
//       );
//       setMessages([]);
//     } catch (err) {
//       console.error("Clear chat failed:", err);
//     }
//   };

//   const handleWallpaperChange = async (uri) => {
//     if (uri) {
//       setWallpaperUri(uri);
//       await SecureStore.setItem("chat_wallpaper", uri);
//     } else {
//       setWallpaperUri(null);
//       await SecureStore.removeItem("chat_wallpaper");
//     }
//   };

//   // ------------------- RENDER -------------------
//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       style={{ flex: 1 }}
//     >
//       <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//         <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
//           <GroupChatHeader
//             onWallpaperChange={handleWallpaperChange}
//             onBlock={() => setIsBlocked(true)}
//             onClearChat={clearChat}
//             GroupDetails={GroupDetails}
//             onLeaveGroup={() => {
//               Alert.alert("Leave Group", "Leave this group?", [
//                 { text: "Cancel", style: "cancel" },
//                 {
//                   text: "Leave",
//                   style: "destructive",
//                   onPress: () => setHasLeftGroup(true),
//                 },
//               ]);
//             }}
//           />

//           {hasLeftGroup ? (
//             <View className="flex-1 justify-center items-center px-4">
//               <Text className="text-center text-gray-600 text-lg">
//                 You have left this group. You cannot send or receive messages.
//               </Text>
//               <TouchableOpacity
//                 onPress={() => router.back()}
//                 className="mt-4 px-5 py-2 bg-indigo-600 rounded-full"
//               >
//                 <Text className="text-white font-semibold text-center">
//                   Back to Groups
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           ) : isBlocked ? (
//             <BlockedOverlay
//               onUnblock={() => setIsBlocked(false)}
//               onDelete={() => {
//                 Alert.alert("Delete Chat", "Delete this chat?", [
//                   { text: "Cancel", style: "cancel" },
//                   {
//                     text: "Delete",
//                     style: "destructive",
//                     onPress: () => {
//                       setMessages([]);
//                       setIsBlocked(false);
//                       router.back();
//                     },
//                   },
//                 ]);
//               }}
//             />
//           ) : (
//             <>
//               {selectedMessages.length > 0 && (
//                 <SelectedMessagesActionBar
//                   selectedCount={selectedMessages.length}
//                   onEdit={editSelectedMessage}
//                   onDelete={deleteSelectedMessages}
//                   onCancel={cancelSelection}
//                 />
//               )}

//               <MessagesList
//                 messages={messages}
//                 onLongPress={handleLongPress}
//                 selectedMessages={selectedMessages}
//                 fadeAnim={fadeAnim}
//                 flatListRef={flatListRef}
//                 wallpaperUri={wallpaperUri}
//                 type={type}
//                 user={user}
//                 setMessages={setMessages}
//                 onDeleteMessage={deleteSelectedMessages}
//                 isLoading={isLoading}
//               />

//               <SendMessageBar
//                 messageText={messageText}
//                 setMessageText={setMessageText}
//                 editingMessageId={editingMessageId}
//                 cancelEditing={cancelSelection}
//                 onSend={handleSend}
//                 handleGetMessage={fetchGroupMessages}
//                 GroupDetails={GroupDetails}
//                 type={type}
//               />
//             </>
//           )}
//         </SafeAreaView>
//       </TouchableWithoutFeedback>
//     </KeyboardAvoidingView>
//   );
// };

// export default GroupMessage;


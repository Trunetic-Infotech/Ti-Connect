// import React, { useEffect, useState } from "react";
// import {
//   View,
//   TextInput,
//   TouchableOpacity,
//   Text,
//   TouchableWithoutFeedback,
//   Alert,
// } from "react-native";
// import { Feather } from "@expo/vector-icons";
// import * as SecureStore from "expo-secure-store";
// import { useLocalSearchParams } from "expo-router";
// import axios from "axios";
// import { useDispatch, useSelector } from "react-redux";
// import { pushNewMessage } from "../../../redux/features/messagesSlice";
// import { getSocket } from "../../../services/socketService";
// import { set } from "date-fns";
// import CameraPicker from "../CameraPicker/CameraPicker";
// import DocumentPickerModal from "../DocumentPicker/DocumentPicker";
// import GalleryPicker from "../GalleryPicker/GalleryPicker";
// import VideoPicker from "../VideoPicker/VideoPicker";
// import AudioPicker from "../AudioPicker/AudioPicker";
// import ContactsModal from "../Contacts/Contacts";
// import useVoiceRecorder from "../VoiceRecorder/VoiceRecorder";

// const SendMessageBar = ({ handleGetMessage, type, GroupDetails }) => {
//   const [attachmentOptionsVisible, setAttachmentOptionsVisible] =
//     useState(false);
//   const [messageText, setMessageText] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const [messagetype, setMessageType] = useState("text");
//   const [mediaType, setMediaType] = useState(null);
// const { recording, startRecording, stopRecording } = useVoiceRecorder();
//   const [galleryVisible, setGalleryVisible] = useState(false);
//   const [documentVisible, setDocumentVisible] = useState(false);
//   const [contactsVisible, setContactsVisible] = useState(false);
//   const dispatch = useDispatch();
//   const myId = useSelector((state) => state.auth?.user?.id);
//   const { user } = useLocalSearchParams();
//   const parsedUser = user ? JSON.parse(user) : null;

//   // console.log("parsendermessage",type );

//   // 🔹 Handle Send
//   const handleSendMessage = async () => {
//     if (!messageText.trim()) return;
//     let msgData = {
//       message: messageText,
//       message_type: "text",
//       created_at: new Date().toISOString(),
//       myId: myId,
//     };

//     if (type === "single") {
//       msgData = { ...msgData, receiver_id: parsedUser?.id };
//     } else if (type === "group") {
//       msgData = { ...msgData, groupId: GroupDetails?.id };
//     } else {
//       Alert.alert("Error", "Invalid chat type");
//       return;
//     }

//     try {
//       // 1️⃣ Emit via socket (real-time)
//       const socket = getSocket();
//       if (socket) {
//         if (type === "single") {
//           socket.emit("newMessage", msgData);
//         } else if (type === "group") {
//           // socket.emit("joinGroup", { userId: myId, groupId: GroupDetails?.id });
//           socket.emit("groupNewMessage", msgData);
//         }
//       }

//       // 2️⃣ Optimistically add to Redux
//       dispatch(pushNewMessage(msgData));

//       // 3️⃣ Clear input
//       setMessageText("");

//       const token = await SecureStore.getItemAsync("token");
//       const url =
//         type === "single"
//           ? `${process.env.EXPO_API_URL}/messages`
//           : `${process.env.EXPO_API_URL}/groups/send/messages`;

//       const response = await axios.post(url, msgData, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       // console.log("responsedaya",response.data);

//       if (response.data.success) {
//         if (typeof handleGetMessage === "function") {
//           handleGetMessage();
//         }
//       } else {
//         console.log("Error sending message:", response.data.message);
//         Alert.alert("Error", "Failed to send message.");
//       }
//     } catch (error) {
//       Alert.alert("❌ API Error:", error.response?.data || error.message);
//       // Alert.alert("Error", "Something went wrong.");
//     }
//   };

//   useEffect(() => {
//     const socket = getSocket();
//     if (!socket) return;

//     const handleNewMessage = (msgData) => {
//       // ✅ only push if relevant
//       if (type === "single") {
//         if (msgData.sender_id === myId || msgData.receiver_id === myId) {
//           dispatch(pushNewMessage(msgData));
//         }
//       } else if (type === "group") {
//         if (msgData.groupId === GroupDetails?.id) {
//           dispatch(pushNewMessage(msgData));
//         }
//       }
//     };

//     if (type === "group") {

//       socket.on("groupNewMessage", handleNewMessage);
//     } else {
//       socket.on("newMessage", handleNewMessage);
//     }

//     return () => {
//       if (type === "group") {
//         socket.off("groupNewMessage", handleNewMessage);
//       } else {
//         socket.off("newMessage", handleNewMessage);
//       }
//     };
//   }, [myId, dispatch, type, GroupDetails?.id]);

//   // ✅ Handle mic (voice)
//   const handleMicPress = async () => {
//     if (!recording) {
//       await startRecording();
//     } else {
//       const voiceMessage = await stopRecording();
//       if (voiceMessage) {
//         await onSend({
//           type: "audio",
//           fileUrl: voiceMessage.uri,
//           mimeType: "audio/m4a",
//         });
//       }
//     }
//   };

//    const handleOutsidePress = () => {
//     if (attachmentOptionsVisible) setAttachmentOptionsVisible(false);
//   };

//   useEffect(()=>{
//     console.log("mediatype",mediaType);

//   },[mediaType])

//   return (
//     <View className="bg-white border-t border-gray-200 p-2.5">
//       {/* Click outside to close attachment options */}
//       {attachmentOptionsVisible && (
//         <TouchableWithoutFeedback onPress={handleOutsidePress}>
//           <View className="absolute inset-0 z-20" />
//         </TouchableWithoutFeedback>
//       )}

//       {/* Attachment Options */}
//       {attachmentOptionsVisible && (
//         <View className="absolute bottom-16 right-4 bg-white rounded-2xl shadow-2xl p-4 w-56 space-y-4 border border-gray-100 z-30">
//           <Text className="text-center text-gray-700 font-semibold text-sm">
//             Send Attachment
//           </Text>

//           <View className="flex flex-wrap flex-row justify-between mt-2">
//             {/* Camera */}
//             <TouchableOpacity
//               className="items-center w-[30%] mb-4"
//               onPress={() =>
//                 CameraPicker((imageMessage) => {
//                   console.log("imageMessage", imageMessage);
//                   onSend(imageMessage);
//                   setMediaType(imageMessage);
//                   setAttachmentOptionsVisible(false);
//                 })
//               }
//             >
//               <View className="w-14 h-14 bg-blue-100 rounded-full justify-center items-center mb-1">
//                 <Feather name="camera" size={22} color="#2563eb" />
//               </View>
//               <Text className="text-xs text-center text-gray-700">Camera</Text>
//             </TouchableOpacity>

//             {/* Gallery */}
//             <TouchableOpacity
//               className="items-center w-[30%] mb-4"
//               onPress={() => setGalleryVisible(true)}
//             >
//               <View className="w-14 h-14 bg-green-100 rounded-full justify-center items-center mb-1">
//                 <Feather name="image" size={22} color="#059669" />
//               </View>
//               <Text className="text-xs text-center text-gray-700">Gallery</Text>
//             </TouchableOpacity>

//             <GalleryPicker
//               visible={galleryVisible}
//               onSend={(imageMessage) => {
//                 onSend(imageMessage);
//               }}
//               onClose={() => setGalleryVisible(false)}
//             />

//             {/* Document */}
//             <TouchableOpacity
//               className="items-center w-[30%] mb-4"
//               onPress={() => setDocumentVisible(true)}
//             >
//               <View className="w-14 h-14 bg-yellow-100 rounded-full justify-center items-center mb-1">
//                 <Feather name="file-text" size={22} color="#d97706" />
//               </View>
//               <Text className="text-xs text-center text-gray-700">Document</Text>
//             </TouchableOpacity>

//             <DocumentPickerModal
//               visible={documentVisible}
//               onSend={(docMessage) => {
//                 onSend(docMessage);
//               }}
//               onClose={() => setDocumentVisible(false)}
//             />

//             {/* Video */}
//             <TouchableOpacity
//               className="items-center w-[30%] mb-4"
//               onPress={() =>
//                 VideoPicker((videoMessage) => {
//                   onSend(videoMessage);
//                   setAttachmentOptionsVisible(false);
//                 })
//               }
//             >
//               <View className="w-14 h-14 bg-red-100 rounded-full justify-center items-center mb-1">
//                 <Feather name="video" size={22} color="#dc2626" />
//               </View>
//               <Text className="text-xs text-center text-gray-700">Video</Text>
//             </TouchableOpacity>

//             {/* Audio */}
//             <TouchableOpacity
//               className="items-center w-[30%] mb-2"
//               onPress={() =>
//                 AudioPicker((audioMessage) => {
//                   onSend(audioMessage);
//                   setAttachmentOptionsVisible(false);
//                 })
//               }
//             >
//               <View className="w-14 h-14 bg-purple-100 rounded-full justify-center items-center mb-1">
//                 <Feather name="music" size={22} color="#9333ea" />
//               </View>
//               <Text className="text-xs text-center text-gray-700">Audio</Text>
//             </TouchableOpacity>

//             {/* Contact */}
//             <TouchableOpacity
//               className="items-center w-[30%] mb-4"
//               onPress={() => setContactsVisible(true)}
//             >
//               <View className="w-14 h-14 bg-pink-100 rounded-full justify-center items-center mb-1">
//                 <Feather name="user" size={22} color="#db2777" />
//               </View>
//               <Text className="text-xs text-center text-gray-700">Contact</Text>
//             </TouchableOpacity>

//             <ContactsModal
//               visible={contactsVisible}
//               onSend={(contactMessage) => {
//                 onSend(contactMessage);
//               }}
//               onClose={() => setContactsVisible(false)}
//             />
//           </View>
//         </View>
//       )}

//       {/* Input + Send */}
//       <View className="flex-row items-center bg-white rounded-full px-4 py-2 shadow-md shadow-black/10">
//         {/* Attach */}
//         <TouchableOpacity
//           className="p-2"
//           onPress={() => setAttachmentOptionsVisible(!attachmentOptionsVisible)}
//         >
//           <Feather name="paperclip" size={22} color="#555" />
//         </TouchableOpacity>

//         {/* Input */}
//         <TextInput
//           className="flex-1 text-base mx-2 text-[#111] py-1"
//           placeholder="Type a message..."
//           placeholderTextColor="#888"
//           value={messageText}
//           onChangeText={setMessageText}
//           multiline
//           onFocus={() => setAttachmentOptionsVisible(false)}
//         />

//         {/* Mic or Send */}
//         {messageText.trim() === "" ? (
//           <TouchableOpacity onPress={handleMicPress}>
//             <Feather
//               name={recording ? "square" : "mic"}
//               size={24}
//               color="#3b82f6"
//             />
//           </TouchableOpacity>
//         ) : (
//           <TouchableOpacity
//             className="p-2 rounded-full bg-blue-500"
//             onPress={handleSendMessage}
//           >
//             <Feather name="send" size={18} color="white" />
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   );

// };

// export default SendMessageBar;
import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { pushNewMessage } from "../../../redux/features/messagesSlice";
import { getSocket } from "../../../services/socketService";
import CameraPicker from "../CameraPicker/CameraPicker";
import DocumentPickerModal from "../DocumentPicker/DocumentPicker";
import GalleryPicker from "../GalleryPicker/GalleryPicker";
import VideoPicker from "../VideoPicker/VideoPicker";
import AudioPicker from "../AudioPicker/AudioPicker";
import ContactsModal from "../Contacts/Contacts";
import useVoiceRecorder from "../VoiceRecorder/VoiceRecorder";
import mimeTypeMap from "./memtype";

const SendMessageBar = ({
  handleGetMessage,
  type,
  GroupDetails,
  messageText,
  setMessageText,
  editingMessageId,
  cancelEditing,
  onSend,
  user,
}) => {
  const [attachmentOptionsVisible, setAttachmentOptionsVisible] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(false);
  const [contactsVisible, setContactsVisible] = useState(false);
  const { recording, startRecording, stopRecording } = useVoiceRecorder();

  const dispatch = useDispatch();
  const myId = useSelector((state) => state.auth?.user?.id);
  const paramsUser = useLocalSearchParams().user;
  const parsedUser = paramsUser ? JSON.parse(paramsUser) : user;

  // ✅ Handle sending message or editing
  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    if (editingMessageId) {
      // Editing existing message
      await onSend({ text: messageText, id: editingMessageId, type: "text" });
      cancelEditing();
    } else {
      // Sending new message
      await onSend({ text: messageText, type: "text" });
    }
  };

  // ✅ Handle mic (voice) messages
  const handleMicPress = async () => {
    if (!recording) {
      await startRecording();
    } else {
      const voiceMessage = await stopRecording();
      if (voiceMessage) {
        await onSend({
          type: "audio",
          uri: voiceMessage.uri,
          mimeType: "audio/m4a",
        });
      }
    }
  };

  // ✅ Handle socket new messages (optional, can remove if already handled globally)
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (msgData) => {
      if (type === "single") {
        if (msgData.sender_id === myId || msgData.receiver_id === myId) {
          dispatch(pushNewMessage(msgData));
        }
      } else if (type === "group") {
        if (msgData.groupId === GroupDetails?.id) {
          dispatch(pushNewMessage(msgData));
        }
      }
    };

    const event = type === "group" ? "groupNewMessage" : "newMessage";
    socket.on(event, handleNewMessage);

    return () => socket.off(event, handleNewMessage);
  }, [myId, dispatch, type, GroupDetails?.id]);

  const handleOutsidePress = () => {
    if (attachmentOptionsVisible) setAttachmentOptionsVisible(false);
  };

  return (
    <View className="bg-white border-t border-gray-200 p-2.5">
      {/* Click outside to close attachment options */}
      {attachmentOptionsVisible && (
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
          <View className="absolute inset-0 z-20" />
        </TouchableWithoutFeedback>
      )}

      {/* Attachment Options */}
      {attachmentOptionsVisible && (
        <View className="absolute bottom-16 right-4 bg-white rounded-2xl shadow-2xl p-4 w-56 space-y-4 border border-gray-100 z-30">
          <Text className="text-center text-gray-700 font-semibold text-sm">
            Send Attachment
          </Text>

          <View className="flex flex-wrap flex-row justify-between mt-2">
            {/* Camera */}
            <TouchableOpacity
              className="items-center w-[30%] mb-4"
              onPress={() =>
                CameraPicker((imageMessage) => {
                  onSend(imageMessage);
                  setAttachmentOptionsVisible(false);
                })
              }
            >
              <View className="w-14 h-14 bg-blue-100 rounded-full justify-center items-center mb-1">
                <Feather name="camera" size={22} color="#2563eb" />
              </View>
              <Text className="text-xs text-center text-gray-700">Camera</Text>
            </TouchableOpacity>

            {/* Gallery */}
            <TouchableOpacity
              className="items-center w-[30%] mb-4"
              onPress={() => setGalleryVisible(true)}
            >
              <View className="w-14 h-14 bg-green-100 rounded-full justify-center items-center mb-1">
                <Feather name="image" size={22} color="#059669" />
              </View>
              <Text className="text-xs text-center text-gray-700">Gallery</Text>
            </TouchableOpacity>

            <GalleryPicker
              visible={galleryVisible}
              onSend={(imageMessage) => {
                console.log("hahaha img msg",imageMessage);
                
                onSend(imageMessage);
                  setAttachmentOptionsVisible(false);

              }}
              onClose={() => setGalleryVisible(false)}
            />

            {/* Document */}
            <TouchableOpacity
              className="items-center w-[30%] mb-4"
              onPress={() => setDocumentVisible(true)}
            >
              <View className="w-14 h-14 bg-yellow-100 rounded-full justify-center items-center mb-1">
                <Feather name="file-text" size={22} color="#d97706" />
              </View>
              <Text className="text-xs text-center text-gray-700">Document</Text>
            </TouchableOpacity>

            <DocumentPickerModal
              visible={documentVisible}
              onSend={(docMessage) => {
                onSend(docMessage);
              }}
              onClose={() => setDocumentVisible(false)}
            />

            {/* Video */}
            <TouchableOpacity
              className="items-center w-[30%] mb-4"
              onPress={() =>
                VideoPicker((videoMessage) => {
                  onSend(videoMessage);
                  setAttachmentOptionsVisible(false);
                })
              }
            >
              <View className="w-14 h-14 bg-red-100 rounded-full justify-center items-center mb-1">
                <Feather name="video" size={22} color="#dc2626" />
              </View>
              <Text className="text-xs text-center text-gray-700">Video</Text>
            </TouchableOpacity>

            {/* Audio */}
            <TouchableOpacity
              className="items-center w-[30%] mb-2"
              onPress={() =>
                AudioPicker((audioMessage) => {
                  onSend(audioMessage);
                  setAttachmentOptionsVisible(false);
                })
              }
            >
              <View className="w-14 h-14 bg-purple-100 rounded-full justify-center items-center mb-1">
                <Feather name="music" size={22} color="#9333ea" />
              </View>
              <Text className="text-xs text-center text-gray-700">Audio</Text>
            </TouchableOpacity>

            {/* Contact */}
            <TouchableOpacity
              className="items-center w-[30%] mb-4"
              onPress={() => setContactsVisible(true)}
            >
              <View className="w-14 h-14 bg-pink-100 rounded-full justify-center items-center mb-1">
                <Feather name="user" size={22} color="#db2777" />
              </View>
              <Text className="text-xs text-center text-gray-700">Contact</Text>
            </TouchableOpacity>

            <ContactsModal
              visible={contactsVisible}
              onSend={(contactMessage) => {
                onSend(contactMessage);
              }}
              onClose={() => setContactsVisible(false)}
            />
          </View>
        </View>
      )}

      {/* Input + Send */}
      <View className="flex-row items-center bg-white rounded-full px-4 py-2 shadow-md shadow-black/10">
        {/* Attach */}
        <TouchableOpacity
          className="p-2"
          onPress={() => setAttachmentOptionsVisible(!attachmentOptionsVisible)}
        >
          <Feather name="paperclip" size={22} color="#555" />
        </TouchableOpacity>

        {/* Input */}
        <TextInput
          className="flex-1 text-base mx-2 text-[#111] py-1"
          placeholder={editingMessageId ? "Edit message..." : "Type a message..."}
          placeholderTextColor="#888"
          value={messageText} // use prop
          onChangeText={setMessageText} // use prop
          multiline
          onFocus={() => setAttachmentOptionsVisible(false)}
        />

        {/* Mic or Send */}
        {messageText.trim() === "" ? (
          <TouchableOpacity onPress={handleMicPress}>
            <Feather
              name={recording ? "square" : "mic"}
              size={24}
              color="#3b82f6"
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="p-2 rounded-full bg-blue-500"
            onPress={handleSendMessage}
          >
            <Feather name="send" size={18} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SendMessageBar;


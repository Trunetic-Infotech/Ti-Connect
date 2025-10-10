// import React, { useEffect, useState } from "react";
// import {
//   View,
//   FlatList,
//   Animated,
//   Image,
//   Text,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import { Video } from "expo-av";
// import VoicePlayer from "../VoicePlayer/VoicePlayer";
// import ContactBubble from "../ContactBubble/ContactBubble";
// import { format } from "date-fns";

// const MessagesList = ({
//   type, // "normal" or "group"
//   user, // current logged in user
//   messages, // array of messages
//   fadeAnim,
//   flatListRef,
//   wallpaperUri,
// }) => {

//    const [show,setShow] = useState(false)

//   const formatTime = (timestamp) => {
//     try {
//       return format(new Date(timestamp), "hh:mm a");
//     } catch {
//       return "";
//     }
//   };

//   // console.log("MessagesListRendered", { messages, type });
//   // 🔹 Auto scroll to bottom on new messages
//   useEffect(() => {
//     if (messages.length > 0 && flatListRef?.current) {
//       setTimeout(() => {
//         flatListRef.current.scrollToEnd({ animated: true });
//       }, 100);
//     }
//   }, [messages]);

//   // 🔹 Render single message
//   const renderMessage = ({ item }) => {
//     let isMe = false;
//     let avatar = null;
//     let senderName = null;

//     // Helper to get initials from name
//     const getInitials = (name) => {
//       if (!name) return "?";
//       const words = name.trim().split(" ");
//       const first = words[0]?.charAt(0) || "";
//       const second = words[1]?.charAt(0) || "";
//       return (first + second).toUpperCase();
//     };

//     if (type === "single") {
//       // ✅ For 1-to-1 chats
//       isMe = item.receiver_id === user?.id;
//       avatar = isMe ? item.sender_image : item.receiver_image;
//       senderName = null; // no need in personal chat
//     } else {
//       // ✅ For group chats
//       isMe = item.isSender; // backend already sets this
//       avatar = item.profile_picture || getInitials(item.username);
//       senderName = item.username?.trim() || "Unknown";
//     }

//     return (
//       <Animated.View>
//         <View
//           className={`max-w-[100%] my-2 flex-row ${isMe ? "self-end justify-end" : "self-start justify-start"}`}
//         >
//           {!isMe &&
//             (item.profile_picture ? (
//               <Image
//                 source={{ uri: avatar }}
//                 className="w-6 h-6 rounded-full mr-1"
//               />
//             ) : (
//               <View className="w-6 h-6 rounded-full bg-gray-300 justify-center items-center mr-1">
//                 <Text className="text-[10px] font-bold text-gray-700">
//                   {avatar}
//                 </Text>
//               </View>
//             ))}
//           {/* Bubble */}
//           <View
//             className={`py-2 px-3 rounded-2xl shadow-sm overflow-hidden max-w-[75%] ${
//               isMe ? "bg-indigo-600" : "bg-yellow-300"
//             }`}
//             style={{
//               borderBottomRightRadius: isMe ? 4 : 18,
//               borderBottomLeftRadius: isMe ? 18 : 4,
//             }}
//           >
//             {/* 🔹 Show sender name in group chat */}
//             {!isMe && senderName && (
//               <Text className="text-[12px] font-semibold text-gray-700 mb-1">
//                 {senderName}
//               </Text>
//             )}

//             {/* Media / Message */}
//             {item.message_type === "image" ? (
//               <Image
//                 source={{ uri: item.media_url }}
//                 resizeMode="cover"

//                 className="w-[200px] h-[200px] rounded-xl"
//               />

//             ) : item.message_type === "video" ? (
//               <Video
//                 source={{ uri: item.media_url }}
//                 controller={true}
//                 className="w-[220px] h-[200px] rounded-xl bg-black"
//                 useNativeControls
//                 resizeMode="contain"
//               />
//             ) : item.message_type === "voice" ? (
//               <VoicePlayer uri={item.media_url} duration={item.duration} />
//             ) : item.message_type === "contact" ? (
//               <ContactBubble message={item} isOwnMessage={isMe} />
//             ) : (
//               <Text
//                 className={`${
//                   isMe ? "text-white" : "text-gray-800"
//                 } text-[15px] leading-5`}
//               >
//                 {item.message || "[empty]"}
//               </Text>
//             )}

//             {/* Time */}
//             {item.created_at && (
//               <Text
//                 className={`text-[10px] mt-1 ${
//                   isMe ? "text-white/60" : "text-gray-600/70"
//                 }`}
//               >
//                 {formatTime(item.created_at)}
//               </Text>
//             )}
//           </View>
//         </View>
//       </Animated.View>
//     );
//   };

//   return (
//     <KeyboardAvoidingView
//       className="flex-1"
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//     >
//       <View
//         className="flex-1"
//         style={{
//           backgroundColor: wallpaperUri ? "transparent" : "#fef3c7",
//         }}
//       >
//         {/* Wallpaper */}
//         {wallpaperUri && (
//           <Image
//             source={{ uri: wallpaperUri }}
//             style={{
//               position: "absolute",
//               width: "100%",
//               height: "100%",
//               resizeMode: "cover",
//             }}
//           />
//         )}

//         {/* No messages */}
//         {messages.length === 0 ? (
//           <View className="flex-1 items-center justify-center">
//             <Text className="text-gray-500">No messages yet</Text>
//           </View>
//         ) : (
//           <FlatList
//             ref={flatListRef}
//             data={messages}
//             keyExtractor={(item, index) =>
//               item.id?.toString() || index.toString()
//             }
//             renderItem={renderMessage}
//             contentContainerStyle={{ padding: 10, flexGrow: 1 }}
//             showsVerticalScrollIndicator={false}
//             initialNumToRender={20}
//             maxToRenderPerBatch={10}
//             windowSize={10}
//             removeClippedSubviews
//             onContentSizeChange={() =>
//               flatListRef?.current?.scrollToEnd({ animated: false })
//             }
//             onLayout={() =>
//               flatListRef?.current?.scrollToEnd({ animated: false })
//             }
//           />
//         )}
//       </View>

//         {message_type === "video" && (
//           <Video
//             source={{ uri: media_url }}
//             controller={true}
//             className="w-[220px] h-[200px] rounded-xl bg-black"
//             useNativeControls
//             resizeMode="contain"
//           />
//         )}
//         {message_type === "voice" && (
//           <VoicePlayer uri={media_url} duration={duration} />
//         )}
//         {message_type === "contact" && (
//           <ContactBubble message={item} isOwnMessage={isMe} />
//         )}
//         {message_type === "image" && (
//           <Image
//             source={{ uri: media_url }}
//             resizeMode="cover"
//             className="w-[200px] h-[200px] rounded-xl"
//           />
//         )}

//     </KeyboardAvoidingView>

//   );
// };

// export default MessagesList;

import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Animated,
  Image,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import { Video } from "expo-av";
import VoicePlayer from "../VoicePlayer/VoicePlayer";
import ContactBubble from "../ContactBubble/ContactBubble";
import { format } from "date-fns";

const MessagesList = ({
  type, // "single" or "group"
  user, // current logged in user
  messages, // array of messages
  fadeAnim,
  flatListRef,
  wallpaperUri,
}) => {
  const [selectedMedia, setSelectedMedia] = useState(null); // { type, uri }
  const screenWidth = Dimensions.get("window").width;

  const formatTime = (timestamp) => {
    try {
      return format(new Date(timestamp), "hh:mm a");
    } catch {
      return "";
    }
  };

  // 🔹 Auto scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0 && flatListRef?.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return "?";
    const words = name.trim().split(" ");
    const first = words[0]?.charAt(0) || "";
    const second = words[1]?.charAt(0) || "";
    return (first + second).toUpperCase();
  };

  // 🔹 Render each message
  const renderMessage = ({ item }) => {
    let isMe = false;
    let avatar = null;
    let senderName = null;

    if (type === "single") {
      // ✅ For 1-to-1 chats
      isMe = item.receiver_id === user?.id;
      avatar = isMe ? item.sender_image : item.receiver_image;
      senderName = null;
    } else {
      // ✅ For group chats
      isMe = item.isSender;
      avatar = item.profile_picture;
      senderName = item.username?.trim() || "Unknown";
    }

    return (
      <Animated.View style={{ opacity: 1 }}>
        <View
          className={`max-w-[100%] my-2 flex-row ${
            isMe ? "self-end justify-end" : "self-start justify-start"
          }`}
        >
          {/* Avatar for received messages */}
          {!isMe &&
            (avatar ? (
              <Image
                source={{ uri: avatar }}
                className="w-8 h-8 rounded-full mr-2"
              />
            ) : (
              <View className="w-8 h-8 rounded-full bg-gray-300 justify-center items-center mr-2">
                <Text className="text-xs font-bold text-gray-700">
                  {getInitials(senderName)}
                </Text>
              </View>
            ))}

          {/* Chat bubble */}
          <View
            className={`py-2 px-3 rounded-2xl shadow-sm overflow-hidden max-w-[75%] ${
              isMe ? "bg-indigo-600" : "bg-yellow-300"
            }`}
            style={{
              borderBottomRightRadius: isMe ? 4 : 18,
              borderBottomLeftRadius: isMe ? 18 : 4,
            }}
          >
            {/* Sender name for group */}
            {!isMe && senderName && (
              <Text className="text-xs font-semibold text-gray-700 mb-1">
                {senderName}
              </Text>
            )}

            {/* 🔹 Message content */}
            {item.message_type === "image" ? (
              <TouchableOpacity
                onPress={() =>
                  setSelectedMedia({ type: "image", uri: item.media_url })
                }
              >
                <Image
                  source={{ uri: item.media_url }}
                  resizeMode="cover"
                  style={{
                    width: screenWidth * 0.55,
                    height: screenWidth * 0.55,
                    borderRadius: 12,
                    backgroundColor: "#e5e7eb",
                  }}
                />
              </TouchableOpacity>
            ) : item.message_type === "video" ? (
              <TouchableOpacity
                onPress={() =>
                  setSelectedMedia({ type: "video", uri: item.media_url })
                }
              >
                <Video
                  source={{ uri: item.media_url }}
                  resizeMode="cover"
                  useNativeControls
                  style={{
                    width: screenWidth * 0.6,
                    height: 200,
                    borderRadius: 12,
                    backgroundColor: "#000",
                  }}
                />
              </TouchableOpacity>
            ) : item.message_type === "audio" ? (
              <TouchableOpacity
                onPress={() =>
                  setSelectedMedia({ type: "audio", uri: item.media_url })
                }
              >
                <VoicePlayer uri={item.media_url} duration={item.duration} />
              </TouchableOpacity>
            ) : item.message_type === "contact" ? (
              <ContactBubble message={item} isOwnMessage={isMe} />
            ) : item.message_type === "document" ? (
              <TouchableOpacity
                onPress={() =>
                  setSelectedMedia({ type: "document", uri: item.media_url })
                }
              >
                <View>
                  <Text className="text-gray-800 underline">
                    {item.media_filename || "View Document"}
                  </Text>
                </View>
                {/* <DocumentViewer uri={item.media_url} /> */}
              </TouchableOpacity>
            ) : item.message_type === "file" ? (
              <TouchableOpacity
                onPress={() =>
                  setSelectedMedia({ type: "file", uri: item.media_url })
                }
              >
                <FileViewer uri={item.media_url} />
              </TouchableOpacity>
            ) : (
              <Text
                className={`${
                  isMe ? "text-white" : "text-gray-800"
                } text-[15px] leading-5`}
              >
                {item.message || "[empty]"}
              </Text>
            )}

            {/* Time */}
            {item.created_at && (
              <Text
                className={`text-[10px] mt-1 ${
                  isMe ? "text-white/60" : "text-gray-600/70"
                } text-right`}
              >
                {formatTime(item.created_at)}
              </Text>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  // 🔹 Main render
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        className="flex-1"
        style={{
          backgroundColor: wallpaperUri ? "transparent" : "#fef3c7",
        }}
      >
        {/* Wallpaper */}
        {wallpaperUri && (
          <Image
            source={{ uri: wallpaperUri }}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              resizeMode: "cover",
            }}
          />
        )}

        {/* No messages */}
        {messages.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">No messages yet</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) =>
              item.id?.toString() || index.toString()
            }
            renderItem={renderMessage}
            contentContainerStyle={{ padding: 10, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews
            onContentSizeChange={() =>
              flatListRef?.current?.scrollToEnd({ animated: false })
            }
            onLayout={() =>
              flatListRef?.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        {/* 🔹 Fullscreen Media Viewer */}
        <Modal
          visible={!!selectedMedia}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedMedia(null)}
        >
          <TouchableWithoutFeedback onPress={() => setSelectedMedia(null)}>
            <View className="flex-1 bg-black/90 justify-center items-center">
              {selectedMedia?.type === "image" && (
                <Image
                  source={{ uri: selectedMedia.uri }}
                  resizeMode="contain"
                  className="w-full h-full"
                />
              )}

              {selectedMedia?.type === "video" && (
                <Video
                  source={{ uri: selectedMedia.uri }}
                  useNativeControls
                  resizeMode="contain"
                  shouldPlay
                  className="w-full h-[60%]"
                />
              )}

              {selectedMedia?.type === "audio" && (
                <View className="bg-white rounded-2xl p-6 w-[80%] items-center">
                  <Text className="text-gray-700 mb-3 font-semibold">
                    Voice Note
                  </Text>
                  <VoicePlayer uri={selectedMedia.uri} />
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

export default MessagesList;

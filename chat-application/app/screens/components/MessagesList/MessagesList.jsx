import React, { useEffect } from "react";
import { View, FlatList, Animated, Image, Text } from "react-native";
import { Video } from "expo-av";
import VoicePlayer from "../VoicePlayer/VoicePlayer";
import ContactBubble from "../ContactBubble/ContactBubble";
import { format } from "date-fns";

const MessagesList = ({
  user,
  messages,
  fadeAnim,
  flatListRef,
  wallpaperUri,
}) => {
  console.log("🔹 user data:", user);
  console.log("🔹 messages count:", messages?.length);
  const formatTime = (timestamp) => {
    try {
      return format(new Date(timestamp), "hh:mm a");
    } catch {
      return "";
    }
  };

  // Auto scroll when messages update
  useEffect(() => {
    if (messages.length > 0 && flatListRef?.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [messages]); // ✅ run whenever messages change

  const renderMessage = ({ item }) => {
    const isMe = item.sender_id === user?.id;
    const avatar = isMe ? item.receiver_image : item.sender_image;
console.log("rendering item:", item.message, "| isMe:", isMe);

    return (
      <Animated.View>
        <View
          className={`max-w-[75%] my-2 flex-row ${
            isMe ? "self-end justify-end" : "self-start justify-start"
          }`}
        >
          {/* Avatar placeholder for incoming */}
          {!isMe ? (
            avatar ? (
              <Image
                source={{ uri: avatar }}
                className="w-8 h-8 rounded-full mr-2"
              />
            ) : (
              <View className="w-8 h-8 mr-2" />
            )
          ) : null}

          {/* Bubble */}
          <View
            className={`py-2.5 px-3.5 rounded-[18px] shadow-md ${
              isMe ? "bg-indigo-700" : "bg-yellow-400"
            }`}
          >
            {item.message_type === "image" ? (
              <Image
                source={{ uri: item.media_url }}
                className="w-[200px] h-[200px] rounded-xl"
              />
            ) : item.message_type === "video" ? (
              <Video
                source={{ uri: item.media_url }}
                className="w-[220px] h-[200px] rounded-xl bg-black"
                useNativeControls
                resizeMode="contain"
              />
            ) : item.message_type === "voice" ? (
              <VoicePlayer uri={item.media_url} duration={item.duration} />
            ) : item.message_type === "contact" ? (
              <ContactBubble message={item} isOwnMessage={isMe} />
            ) : (
              <Text
                className={`${isMe ? "text-white" : "text-gray-800"} text-[15px]`}
              >
                {item.message || "[empty]"}
              </Text>
            )}

            {/* Time */}
            {item.created_at && (
              <Text
                className={`text-[10px] mt-1 ${isMe ? "text-white/70" : "text-gray-700/70"}`}
              >
                {formatTime(item.created_at)}
              </Text>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        zIndex: 0,
        backgroundColor: wallpaperUri ? "transparent" : "#fef3c7",
      }}
    >
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

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
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
            inverted
            contentContainerStyle={{ padding: 10 }}
          />
        )}
      </Animated.View>
    </View>
  );
};

export default MessagesList;



// import React, { useEffect } from "react";
// import { View, FlatList, Animated, Image, Text } from "react-native";
// import { Video } from "expo-av";
// import VoicePlayer from "../VoicePlayer/VoicePlayer";
// import ContactBubble from "../ContactBubble/ContactBubble";
// import { format } from "date-fns";

// const MessagesList = ({ user, messages, fadeAnim, flatListRef, wallpaperUri }) => {
//   const formatTime = (timestamp) => {
//     try {
//       return format(new Date(timestamp), "hh:mm a");
//     } catch {
//       return "";
//     }
//   };

//   // Auto scroll when messages update
//   useEffect(() => {
//     if (messages.length > 0 && flatListRef?.current) {
//       try {
//         flatListRef.current.scrollToOffset({ offset: 0, animated: true });
//       } catch (e) {
//         console.log("Scroll error:", e);
//       }
//     }
//   }, [messages]);

//   const renderMessage = ({ item }) => {
//     const isMe = item.sender_id === user?.id;

//     return (
//       <Animated.View>
//         <View
//           className={`max-w-[75%] my-2 flex-row ${
//             isMe ? "self-end justify-end" : "self-start justify-start"
//           }`}
//         >
//           {/* Bubble */}
//           <View
//             className={`py-2.5 px-3.5 rounded-[18px] shadow-md ${
//               isMe ? "bg-indigo-700" : "bg-yellow-400"
//             }`}
//           >
//             {item.message_type === "image" ? (
//               <Image
//                 source={{ uri: item.media_url }}
//                 className="w-[200px] h-[200px] rounded-xl"
//               />
//             ) : item.message_type === "video" ? (
//               <Video
//                 source={{ uri: item.media_url }}
//                 className="w-[220px] h-[200px] rounded-xl bg-black"
//                 useNativeControls
//                 resizeMode="contain"
//               />
//             ) : item.message_type === "audio" ? (
//               <VoicePlayer uri={item.media_url} duration={item.duration} />
//             ) : item.message_type === "contact" ? (
//               <ContactBubble message={item} isOwnMessage={isMe} />
//             ) : item.message_type === "file" ? (
//               <Text className="text-sm text-gray-800">📄 File: {item.media_url}</Text>
//             ) : (
//               <Text
//                 className={`${isMe ? "text-white" : "text-gray-800"} text-[15px]`}
//               >
//                 {item.message || "[empty]"}
//               </Text>
//             )}

//             {/* Time */}
//             {item.created_at && (
//               <Text
//                 className={`text-[10px] mt-1 ${
//                   isMe ? "text-white/70" : "text-gray-700/70"
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
//     <View
//       style={{
//         flex: 1,
//         zIndex: 0,
//         backgroundColor: wallpaperUri ? "transparent" : "#fef3c7",
//       }}
//     >
//       {wallpaperUri && (
//         <Image
//           source={{ uri: wallpaperUri }}
//           style={{
//             position: "absolute",
//             width: "100%",
//             height: "100%",
//             resizeMode: "cover",
//           }}
//         />
//       )}

//       <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
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
//             inverted
//             contentContainerStyle={{ padding: 10 }}
//           />
//         )}
//       </Animated.View>
//     </View>
//   );
// };

// export default MessagesList;



//revers condition 
// const renderMessage = ({ item }) => {
//   // 🔄 Reversed condition: true if I'm the receiver
//   const isMe = item.receiver_id === user?.id;

//   // Avatar now depends on reversed logic
//   const avatar = isMe ? item.sender_image : item.receiver_image;

//   console.log("rendering item:", item.message, "| isMe:", isMe);

//   return (
//     <Animated.View>
//       <View
//         className={`max-w-[75%] my-2 flex-row ${
//           isMe ? "self-end justify-end" : "self-start justify-start"
//         }`}
//       >
//         {/* Avatar placeholder for incoming */}
//         {!isMe ? (
//           avatar ? (
//             <Image
//               source={{ uri: avatar }}
//               className="w-8 h-8 rounded-full mr-2"
//             />
//           ) : (
//             <View className="w-8 h-8 mr-2" />
//           )
//         ) : null}

//         {/* Bubble */}
//         <View
//           className={`py-2.5 px-3.5 rounded-[18px] shadow-md ${
//             isMe ? "bg-indigo-700" : "bg-yellow-400"
//           }`}
//         >
//           {item.message_type === "image" ? (
//             <Image
//               source={{ uri: item.media_url }}
//               className="w-[200px] h-[200px] rounded-xl"
//             />
//           ) : item.message_type === "video" ? (
//             <Video
//               source={{ uri: item.media_url }}
//               className="w-[220px] h-[200px] rounded-xl bg-black"
//               useNativeControls
//               resizeMode="contain"
//             />
//           ) : item.message_type === "voice" ? (
//             <VoicePlayer uri={item.media_url} duration={item.duration} />
//           ) : item.message_type === "contact" ? (
//             <ContactBubble message={item} isOwnMessage={isMe} />
//           ) : (
//             <Text
//               className={`${isMe ? "text-white" : "text-gray-800"} text-[15px]`}
//             >
//               {item.message || "[empty]"}
//             </Text>
//           )}

//           {/* Time */}
//           {item.created_at && (
//             <Text
//               className={`text-[10px] mt-1 ${
//                 isMe ? "text-white/70" : "text-gray-700/70"
//               }`}
//             >
//               {formatTime(item.created_at)}
//             </Text>
//           )}
//         </View>
//       </View>
//     </Animated.View>
//   );
// };



















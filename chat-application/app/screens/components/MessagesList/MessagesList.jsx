// import React, { useEffect } from "react";
// import { View, FlatList, Animated, Image, Text } from "react-native";
// import { Video } from "expo-av";
// import VoicePlayer from "../VoicePlayer/VoicePlayer";
// import ContactBubble from "../ContactBubble/ContactBubble";
// import { format } from "date-fns";
// import { ScrollView } from "react-native";

// const MessagesList = ({
//   user,
//   messages,
//   fadeAnim,
//   flatListRef,
//   wallpaperUri,
// }) => {
//   console.log("🔹 user data:", user);
//   console.log("🔹 messages count:", messages?.length);
//   const formatTime = (timestamp) => {
//     try {
//       return format(new Date(timestamp), "hh:mm a");
//     } catch {
//       return "";
//     }
//   };

//   // Auto scroll when messages update
//  useEffect(() => {
//   if (messages.length > 0 && flatListRef?.current) {
//     flatListRef.current.scrollToEnd({ animated: true }); // 👈 scrolls to bottom
//   }
// }, [messages]);
//  // ✅ run whenever messages change

//   const renderMessage = ({ item }) => {
//   const isMe = item.receiver_id === user?.id;
//   const avatar = isMe ? item.sender_image : item.receiver_image;
//   console.log("rendering item:", item.message, "| isMe:", isMe);

//   return (
//     <Animated.View>
//       <View
//         className={`max-w-[100%] my-2 flex-row ${
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
//           className={`py-2 px-3 rounded-[18px] shadow-md overflow-hidden max-w-[75%] ${
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
//               className={`${
//                 isMe ? "text-white" : "text-gray-800"
//               } text-[15px]`}
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

//   // console.log("sdkhfusfkgbsaeuifdase", messages[0].message);

//   return (
//      <View
//   className="flex-1"
//   style={{
//     backgroundColor: wallpaperUri ? "transparent" : "#fef3c7",
//   }}
// >
//   {wallpaperUri && (
//     <Image
//       source={{ uri: wallpaperUri }}
//       style={{
//         position: "absolute",
//         width: "100%",
//         height: "100%",
//         resizeMode: "cover",
//       }}
//     />
//   )}

//   {messages.length === 0 ? (
//     <View className="flex-1 items-center justify-center">
//       <Text className="text-gray-500">No messages yet</Text>
//     </View>
//   ) : (
//     <FlatList
//       ref={flatListRef}
//       data={messages}
//       keyExtractor={(item, index) =>
//         item.id?.toString() || index.toString()
//       }
//       renderItem={renderMessage}

//       contentContainerStyle={{
//         padding: 10,
//         // paddingBottom: 50, // keeps space for input box
//         flexGrow: 1,
//       }}
//         initialNumToRender={20}      // first render batch
//   maxToRenderPerBatch={10}     // load in chunks
//   windowSize={7}               // keep nearby messages in memory
//   removeClippedSubviews={true} // recycle offscreen views
//     />
//   )}
// </View>

//   );
// };

// export default MessagesList;
import React, { useEffect } from "react";
import {
  View,
  FlatList,
  Animated,
  Image,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
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
        flatListRef.current.scrollToEnd({
          animated: true, // ✅ smooth scrolling
        });
      }, 100);
    }
  }, [messages]);

  // 🔹 Render a single message
  const renderMessage = ({ item }) => {
    const isMe = item.receiver_id === user?.id;
    const avatar = isMe ? item.sender_image : item.receiver_image;

    return (
      <Animated.View>
        <View
          className={`max-w-[100%] my-2 flex-row px-2 ${
            isMe ? "self-end justify-end" : "self-start justify-start"
          }`}
        >
          {/* Avatar for incoming */}
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
            className={`py-2 px-3 rounded-2xl shadow-sm overflow-hidden max-w-[75%] ${
              isMe ? "bg-indigo-600" : "bg-yellow-300"
            }`}
            style={{
              borderBottomRightRadius: isMe ? 4 : 18,
              borderBottomLeftRadius: isMe ? 18 : 4,
            }}
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
                }`}
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
            contentContainerStyle={{
              padding: 10,
              // paddingBottom: 80,
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews
            // 👇 auto-scroll on first render and new messages
            onContentSizeChange={() =>
              flatListRef?.current?.scrollToEnd({ animated: false })
            }
            onLayout={() =>
              flatListRef?.current?.scrollToEnd({ animated: false })
            }
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default MessagesList;

import React, { useEffect, useState, useRef, useCallback, memo } from "react";
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
  Alert,
  ActivityIndicator,
} from "react-native";
import { Video } from "expo-av";
import VoicePlayer from "../VoicePlayer/VoicePlayer";
import ContactBubble from "../ContactBubble/ContactBubble";
import DocumentViewer from "../DocumentViewer/DocumentViewer";
import { format } from "date-fns";
import axios from "axios";
import MediaItem from "../MediaItems/MediaItem";

const MessageBubble = memo(({ 
  item, 
  isMe, 
  screenWidth, 
  senderName, 
  avatar, 
  getInitials, 
  handleLongPress, 
  handleOpenMedia, 
  formatTime 
}) => {
  return (
    <Animated.View style={{ opacity: 1 }}>
      <View
        className={`max-w-[100%] my-2 flex-row ${
          isMe ? "self-end justify-end" : "self-start justify-start"
        }`}
      >
        {/* Avatar */}
        {!isMe &&
          (avatar ? (
            <Image source={{ uri: avatar }} className="w-8 h-8 rounded-full mr-2" />
          ) : (
            <View className="w-8 h-8 rounded-full bg-gray-300 justify-center items-center mr-2">
              <Text className="text-xs font-bold text-gray-700">
                {getInitials(senderName)}
              </Text>
            </View>
          ))}

        {/* Chat Bubble */}
        <TouchableWithoutFeedback onLongPress={() => handleLongPress(item)}>
          <View
            className={`py-2 px-3 rounded-2xl shadow-sm overflow-hidden max-w-[75%] ${
              isMe ? "bg-indigo-600" : "bg-yellow-300"
            } ${item.message_type === "contact" ? "p-1 max-w-[90%]" : ""}`}
            style={{
              borderBottomRightRadius: isMe ? 4 : 18,
              borderBottomLeftRadius: isMe ? 18 : 4,
            }}
          >
            {/* Group sender name */}
            {!isMe && senderName && (
              <Text className="text-xs font-semibold text-gray-700 mb-1">
                {senderName}
              </Text>
            )}

            {/* Message content */}
            {item.message_type === "image" ? (
              <TouchableOpacity onPress={() => handleOpenMedia("image", item.media_url)}>
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
              <MediaItem item={item} onSelect={handleOpenMedia} />
            ) : item.message_type === "audio" ? (
              <TouchableOpacity
                onPress={() => handleOpenMedia("audio", item.media_url, {
                  duration: item.duration,
                })}
              >
                <VoicePlayer uri={item.media_url} duration={item.duration || 0} />
              </TouchableOpacity>
            ) : item.message_type === "contact" ? (
              <ContactBubble message={item} isOwnMessage={isMe} />
            ) : item.message_type === "document" ? (
              <TouchableOpacity onPress={() => handleOpenMedia("document", item.media_url)}>
                <DocumentViewer uri={item.media_url} />
              </TouchableOpacity>
            ) : (
              <Text className={`${isMe ? "text-white" : "text-gray-800"} text-[15px] leading-5`}>
                {item.message || "[empty]"}{" "}
                {item.isEdited && (
                  <Text className={`text-[10px] ${isMe ? "text-white/70" : "text-gray-600"}`}>
                    (edited)
                  </Text>
                )}
              </Text>
            )}

            {/* Time + Status */}
            {item.created_at && (
              <View className="flex-row items-center justify-end mt-1">
                <Text className={`text-[10px] ${isMe ? "text-white/60" : "text-gray-600/70"}`}>
                  {formatTime(item.created_at)}
                </Text>
                {isMe && (
                  <Text className="text-[10px] ml-2 font-semibold text-white/70">
                    {item.status === "sent" && "Sent"}
                    {item.status === "delivered" && "Delivered"}
                    {item.status === "read" && "Read"}
                  </Text>
                )}
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Animated.View>
  );
});

const MessagesList = ({
  type, // "single" or "group"
  user, // current logged-in user
  messages, // array of messages
  setMessages,
  // fadeAnim,
  flatListRef,
  wallpaperUri,
  onDeleteMessage, // delete handler from parent
  onEditMessage, // edit handler from parent
  isLoading,
}) => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const screenWidth = Dimensions.get("window").width;
  const viewableItemsRef = useRef([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      fadeAnim.stopAnimation();
    }
  }, [isLoading]);

  // 🕒 Format time safely
  const formatTime = (timestamp) => {
    try {
      return format(new Date(timestamp), "hh:mm a");
    } catch {
      return "";
    }
  };

  const handleOpenMedia = (type, uri, extra = {}) => {
    if (!uri) return;
    setSelectedMedia({ type, uri, ...extra });
  };

  const handleCloseMedia = () => setSelectedMedia(null);

  // 🔹 Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && flatListRef?.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }

    // 🔹 Mark all incoming messages as delivered when chat opens
    // if (user) {
    //   messages.forEach((msg) => {
    //     if (msg.status === "sent" && msg.receiver_id !== user.id) {
    //       axios
    //         .post(`${process.env.EXPO_API_URL}/messages/${msg.id}/delivered`)
    //         .catch((err) => console.log("Error marking delivered:", err));
    //     }
    //   });
    // }
  }, [messages, user]);

  // 🔹 Helper to get initials
  const getInitials = (name) => {
    if (!name) return "?";
    const words = name.trim().split(" ");
    const first = words[0]?.charAt(0) || "";
    const second = words[1]?.charAt(0) || "";
    return (first + second).toUpperCase();
  };

  // 🔹 Handle long press for Edit/Delete
  const handleLongPress = (item) => {
    if (!user) return;
    if (Number(user.id) !== item.receiver_id) {
      Alert.alert("You can only edit your own messages.");
      return;
    }

    const isTextMessage = item.message_type === "text";
    const actions = [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          if (onDeleteMessage) onDeleteMessage(item.id);
        },
      },
    ];

    if (isTextMessage) {
      actions.splice(1, 0, {
        text: "Edit",
        onPress: () => {
          if (onEditMessage) onEditMessage(item);
        },
      });
    }

    Alert.alert("Message Actions", "", actions);
  };

  // 🔹 Handle viewable messages to mark read
  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }) => {
      if (!user) return;

      viewableItems.forEach((item) => {
        const msg = item.item;

        if (msg.receiver_id !== user.id && msg.status !== "read") {
          // Call API
          axios
            .post(`${process.env.EXPO_API_URL}/messages/${msg.id}/read`)
            .catch((err) => console.log("Error marking read:", err));

          // Update local messages so UI updates immediately
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msg.id ? { ...m, status: "read", is_read: 1 } : m
            )
          );
        }
      });
    },
    [user]
  );

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

  // 🔹 Render message bubble
  // const renderMessage = ({ item }) => {
  //   if (!user) return null;
  //   const isMe =
  //     type === "single"
  //       ? item.receiver_id === user.id
  //       : item.sender_id === user.id; // fixed logic
  //   const avatar = isMe ? item.sender_image : item.receiver_image;
  //   const senderName = type === "group" ? item.username?.trim() : null;

  //   return (
  //     <Animated.View style={{ opacity: 1 }}>
  //       <View
  //         className={`max-w-[100%] my-2 flex-row ${
  //           isMe ? "self-end justify-end" : "self-start justify-start"
  //         }`}>
  //         {/* Avatar for received messages */}
  //         {!isMe &&
  //           (avatar ? (
  //             <Image
  //               source={{ uri: avatar }}
  //               className='w-8 h-8 rounded-full mr-2'
  //             />
  //           ) : (
  //             <View className='w-8 h-8 rounded-full bg-gray-300 justify-center items-center mr-2'>
  //               <Text className='text-xs font-bold text-gray-700'>
  //                 {getInitials(senderName)}
  //               </Text>
  //             </View>
  //           ))}

  //         {/* Chat Bubble */}
  //         <TouchableWithoutFeedback onLongPress={() => handleLongPress(item)}>
  //           <View
  //             className={`py-2 px-3 rounded-2xl shadow-sm overflow-hidden max-w-[75%] ${
  //               isMe ? "bg-indigo-600" : "bg-yellow-300"
  //             } ${item.message_type === "contact" ? "p-1 max-w-[90%]" : ""}`}
  //             style={{
  //               borderBottomRightRadius: isMe ? 4 : 18,
  //               borderBottomLeftRadius: isMe ? 18 : 4,
  //             }}>
  //             {/* Sender name for group */}
  //             {!isMe && senderName && (
  //               <Text className='text-xs font-semibold text-gray-700 mb-1'>
  //                 {senderName}
  //               </Text>
  //             )}

  //             {/* 🟡 Message Types */}
  //             {item.message_type === "image" ? (
  //               <TouchableOpacity
  //                 onPress={() =>
  //                   setSelectedMedia({ type: "image", uri: item.media_url })
  //                 }>
  //                 <Image
  //                   source={{ uri: item.media_url }}
  //                   resizeMode='cover'
  //                   style={{
  //                     width: screenWidth * 0.55,
  //                     height: screenWidth * 0.55,
  //                     borderRadius: 12,
  //                     backgroundColor: "#e5e7eb",
  //                   }}
  //                 />
  //               </TouchableOpacity>
  //             ) : item.message_type === "video" ? (
  //               <MediaItem item={item} onSelect={handleOpenMedia} />
  //             ) : item.message_type === "audio" ? (
  //               <TouchableOpacity
  //                 onPress={() =>
  //                   setSelectedMedia({
  //                     type: "audio",
  //                     uri: item.media_url,
  //                     duration: item.duration,
  //                   })
  //                 }>
  //                 <VoicePlayer
  //                   uri={item.media_url}
  //                   duration={item.duration || 0}
  //                 />
  //               </TouchableOpacity>
  //             ) : item.message_type === "contact" ? (
  //               <ContactBubble message={item} isOwnMessage={isMe} />
  //             ) : item.message_type === "document" ? (
  //               <TouchableOpacity
  //                 onPress={() =>
  //                   setSelectedMedia({ type: "document", uri: item.media_url })
  //                 }>
  //                 <DocumentViewer uri={item.media_url} />
  //               </TouchableOpacity>
  //             ) : (
  //               <Text
  //                 className={`${
  //                   isMe ? "text-white" : "text-gray-800"
  //                 } text-[15px] leading-5`}>
  //                 {item.message || "[empty]"}{" "}
  //                 {item.isEdited && (
  //                   <Text
  //                     className={`text-[10px] ${
  //                       isMe ? "text-white/70" : "text-gray-600"
  //                     }`}>
  //                     (edited)
  //                   </Text>
  //                 )}
  //               </Text>
  //             )}

  //             {/* Time + Status */}
  //             {item.created_at && (
  //               <View className='flex-row items-center justify-end mt-1'>
  //                 <Text
  //                   className={`text-[10px] ${
  //                     isMe ? "text-white/60" : "text-gray-600/70"
  //                   }`}>
  //                   {formatTime(item.created_at)}
  //                 </Text>

  //                 {isMe && (
  //                   <Text className='text-[10px] ml-2 font-semibold text-white/70'>
  //                     {item.status === "sent" && "Sent"}
  //                     {item.status === "delivered" && "Delivered"}
  //                     {item.status === "read" && "Read"}
  //                   </Text>
  //                 )}
  //               </View>
  //             )}
  //           </View>
  //         </TouchableWithoutFeedback>
  //       </View>
  //     </Animated.View>
  //   );
  // };

  const renderMessage = useCallback(
  ({ item }) => {
    if (!user) return null;

    const isMe =
      type === "single"
        ? item.receiver_id === user.id
        : item.sender_id === user.id;

    const avatar = isMe ? item.sender_image : item.receiver_image;
    const senderName = type === "group" ? item.username?.trim() : null;

    return (
      <MessageBubble
        item={item}
        isMe={isMe}
        screenWidth={screenWidth}
        senderName={senderName}
        avatar={avatar}
        getInitials={getInitials}
        handleLongPress={handleLongPress}
        handleOpenMedia={handleOpenMedia}
        formatTime={formatTime}
      />
    );
  },
  [user, type, screenWidth]
);


  // 🔹 Main render
  if (!user) {
    return (
      <View className='flex-1 items-center justify-center'>
        <Text className='text-gray-500'>Loading user...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className='flex-1'
      behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View
        className='flex-1'
        style={{
          backgroundColor: wallpaperUri ? "transparent" : "#fef3c7",
        }}>
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
          <View className='flex-1 items-center justify-center'>
            <Text className='text-gray-500'>No messages yet</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => String(item?.id || index)}
            renderItem={renderMessage}
            contentContainerStyle={{ padding: 10, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={true}
            onContentSizeChange={() =>
              flatListRef?.current?.scrollToEnd({ animated: false })
            }
            onLayout={() =>
              flatListRef?.current?.scrollToEnd({ animated: false })
            }
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
          />
        )}

        {/* 🔹 Fullscreen Media Viewer */}
        <Modal
          visible={!!selectedMedia}
          transparent
          animationType='fade'
          onRequestClose={() => setSelectedMedia(null)}>
          <TouchableWithoutFeedback onPress={() => setSelectedMedia(null)}>
            <View className='flex-1 bg-black/90 justify-center items-center'>
              {selectedMedia?.type === "image" && (
                <Image
                  source={{ uri: selectedMedia.uri }}
                  resizeMode='contain'
                  className='w-full h-full'
                />
              )}

              {selectedMedia?.type === "video" && (
                <Video
                  source={{ uri: selectedMedia.uri }}
                  useNativeControls
                  resizeMode='contain'
                  shouldPlay
                  className='w-full h-[60%]'
                />
              )}

              {selectedMedia?.type === "audio" && (
                <View className='bg-white rounded-2xl p-6 w-[80%] items-center'>
                  <Text className='text-gray-700 mb-3 font-semibold'>
                    Voice Note
                  </Text>
                  <VoicePlayer uri={selectedMedia.uri} />
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        {isLoading && (
          <View className='flex-row self-end justify-end my-2 mr-3 '>
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [
                  {
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1.05],
                    }),
                  },
                ],
              }}
              className='bg-indigo-600 px-4 py-2 rounded-2xl shadow-md'>
              <Text className='text-white text-sm font-medium'>Sending...</Text>
            </Animated.View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default MessagesList;

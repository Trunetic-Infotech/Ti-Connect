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

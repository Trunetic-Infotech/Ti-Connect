import React from "react";
import {
  View,
  FlatList,
  Animated,
  Image,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Video } from "expo-av";
import VoicePlayer from "../VoicePlayer/VoicePlayer";

const MessagesList = ({
  messages,
  onLongPress,
  selectedMessages,
  fadeAnim,
  flatListRef,
  wallpaperUri,
}) => {
  const handleOpenDocument = async (uri, name) => {
    try {
      let fileUri = uri;

      if (uri.startsWith("http")) {
        const downloadPath = `${FileSystem.cacheDirectory}${name || "document"}`;
        const { uri: localUri } = await FileSystem.downloadAsync(
          uri,
          downloadPath
        );
        fileUri = localUri;
      }

      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        Alert.alert("File not found", "This file is no longer available.");
        return;
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Not supported", "Your device cannot open this file.");
      }
    } catch (error) {
      console.log("Error opening document:", error);
      Alert.alert("Error", "Unable to open document.");
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === "You";
    const isSelected = selectedMessages.includes(item.id);

    let bubbleBg = isMe ? "bg-indigo-700" : "bg-yellow-400";
    if (item.type === "document") bubbleBg = "bg-gray-200";

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }}
      >
        <TouchableOpacity
          onLongPress={() => onLongPress(item)}
          onPress={() => {
            if (selectedMessages.length > 0) {
              onLongPress(item);
            } else if (item.type === "document") {
              handleOpenDocument(item.uri, item.name);
            }
          }}
          activeOpacity={0.8}
          className={`max-w-[75%] my-2 flex-row ${
            isMe ? "self-end justify-end" : "self-start justify-start"
          }`}
        >
          {!isMe && (
            <Image source={item.avatar} className="w-8 h-8 rounded-full mr-2" />
          )}

          {/* Bubble */}
          <View
            className={`${
              item.type !== "image" &&
              item.type !== "video" &&
              item.type !== "voice"
                ? `py-2.5 px-3.5 rounded-[18px] shadow-md ${bubbleBg}`
                : ""
            } ${isMe && item.type === "text" ? "rounded-br-none" : ""} ${
              !isMe && item.type === "text" ? "rounded-bl-none" : ""
            } ${isSelected ? "border-2 border-blue-400 bg-blue-100" : ""}`}
          >
            {isSelected && (
              <View className="absolute -top-2 -left-2 bg-white rounded-full p-1 border border-blue-400 z-10">
                <Feather name="check" size={14} color="blue" />
              </View>
            )}

            {/* Image */}
            {item.type === "image" ? (
              <Image
                source={{ uri: item.uri }}
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: 12,
                  resizeMode: "cover",
                }}
              />
            ) : item.type === "video" ? (
              <Video
                source={{ uri: item.uri }}
                style={{
                  width: 220,
                  height: 200,
                  borderRadius: 12,
                  backgroundColor: "#000",
                }}
                useNativeControls
                resizeMode="contain"
              />
            ) : item.type === "voice" ? (
              <View className="py-1 px-1">
                <VoicePlayer uri={item.uri} duration={item.duration} />
              </View>
            ) : item.type === "document" ? (
              <View className="flex-row items-center">
                <Feather name="file-text" size={20} color="#333" />
                <Text
                  className="ml-2 text-[15px] text-gray-800"
                  numberOfLines={1}
                >
                  {item.name || "Document"}
                </Text>
              </View>
            ) : (
              <Text
                className={`text-[15px] leading-5 ${
                  isMe ? "text-white" : "text-gray-800"
                }`}
              >
                {item.text}
              </Text>
            )}

            {/* Time */}
            {item.time && (
              <Text
                className={`text-[10px] mt-1 ${
                  item.type === "document"
                    ? "text-gray-700/70"
                    : isMe
                      ? "text-white/70"
                      : "text-gray-700/70"
                }`}
              >
                {item.time}
              </Text>
            )}
          </View>
        </TouchableOpacity>
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
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          inverted
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </View>
  );
};

export default MessagesList;

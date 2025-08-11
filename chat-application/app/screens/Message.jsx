import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Alert,
  Animated,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FontAwesome6,
  Entypo,
  Feather,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as MediaLibrary from "expo-media-library";
import { Camera } from "expo-camera";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Audio, Video } from "expo-av";
import { useRouter } from "expo-router";
import img from "../../assets/images/dp.jpg";
import { Vibration } from "react-native";
import clsx from "clsx";
import { ImageBackground } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import WallPaper from "./components/ChangeWallPaper/WallPaper";
import BlockedOverlay from "./components/BlockContact/BlockedOverlay";

const initialMessages = [
  {
    id: 1,
    text: "Hey there!",
    sender: "other",
    time: "10:50 AM",
    status: "seen",
  },
  {
    id: 2,
    text: "Hi! How are you doing today?",
    sender: "me",
    time: "10:51 AM",
    status: "seen",
  },
];

const Message = () => {
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [attachedFile, setAttachedFile] = useState(null);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState(null);
  const [attachmentOptionsVisible, setAttachmentOptionsVisible] =
    useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const isRecordingRef = useRef(false);
  const currentPlayingSoundRef = useRef(null);
  const cancelSelection = () => setSelectedMessages([]);
  const [wallpaperUri, setWallpaperUri] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);

  const videoRef = useRef(null);

  useEffect(() => {
    const loadWallpaper = async () => {
      const uri = await AsyncStorage.getItem("chat_wallpaper");
      if (uri) setWallpaperUri(uri);
    };
    loadWallpaper();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const getCurrentTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleSend = () => {
    const time = getCurrentTime();

    if (messageText.trim() === "" && !attachedFile) return;

    const newMessage = {
      id: Date.now(),
      sender: "me",
      time,
      status: "sent",
    };

    // ✅ Attach text if exists
    if (messageText.trim()) {
      newMessage.text = messageText.trim();
    }

    // ✅ Attach image/video/audio/file
    if (attachedFile) {
      const { type, uri } = attachedFile;

      if (type === "image") {
        newMessage.image = uri;
      } else if (type === "video") {
        newMessage.video = uri;
      } else if (type === "audio" || type === "file") {
        newMessage.file = uri;
      }
    }

    // ✅ Edit or Add message
    if (editingMessageId !== null) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === editingMessageId ? { ...msg, text: messageText } : msg
        )
      );
      setEditingMessageId(null);
    } else {
      setMessages((prev) => [...prev, newMessage]);
    }

    // ✅ Clear input and attachment
    setMessageText("");
    setAttachedFile(null);
  };

  const handleLongPress = (message) => {
    if (message.sender !== "me") return;

    // Trigger haptic feedback (optional, for real device)
    Vibration.vibrate(50);

    if (selectedMessages.length > 0) {
      toggleMessageSelection(message.id);
    } else {
      setSelectedMessages([message.id]);
    }
  };

  const toggleMessageSelection = (id) => {
    setSelectedMessages((prev) =>
      prev.includes(id) ? prev.filter((msgId) => msgId !== id) : [...prev, id]
    );
  };

  const deleteSelectedMessages = () => {
    setMessages((prev) =>
      prev.filter((msg) => !selectedMessages.includes(msg.id))
    );
    setSelectedMessages([]);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Media library access is required.");
      return;
    }

    setAttachmentOptionsVisible(false);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const selected = result.assets[0];
      setAttachedFile({
        type: "image",
        uri: selected.uri,
      });
    }
  };

  const pickDocument = async () => {
    if (Platform.OS === "android") {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Please allow access to files.");
        return;
      }
    }

    setAttachmentOptionsVisible(false);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.type === "success") {
        setAttachedFile({
          type: "file",
          uri: result.uri,
          name: result.name,
        });
      }
    } catch (error) {
      Alert.alert("Error", "Could not pick the document.");
    }
  };

  const pickCamera = async () => {
    // Request Camera permission
    const { status: cameraStatus } =
      await Camera.requestCameraPermissionsAsync();
    if (cameraStatus !== "granted") {
      Alert.alert("Permission Denied", "Please allow camera access.");
      return;
    }

    // Request Media Library permission (for saving the image)
    const { status: mediaStatus } =
      await MediaLibrary.requestPermissionsAsync();
    if (mediaStatus !== "granted") {
      Alert.alert("Permission Denied", "Please allow media library access.");
      return;
    }

    // setAttachmentOptionsVisible(false);

    // Launch camera
    setAttachmentOptionsVisible(false);
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setAttachedFile({
        type: result.assets[0].type === "video" ? "video" : "image",
        uri: result.assets[0].uri,
      });
    }
  };

  const pickVideo = async () => {
    // ✅ Request permission for media library
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Please allow access to media library.");
      return;
    }

    setAttachmentOptionsVisible(false);

    // ✅ Launch video picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const selectedVideo = result.assets[0];
      setAttachedFile({
        type: "video",
        uri: selectedVideo.uri,
        name: selectedVideo.fileName || "video.mp4", // safer fallback
      });
    }
  };

  const pickAudio = async () => {
    setAttachmentOptionsVisible(false);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });

      if (result.type === "success") {
        setAttachedFile({
          type: "audio",
          uri: result.uri,
          name: result.name || "audio.mp3",
        });
      }
    } catch (error) {
      console.error("Audio Picker Error:", error);
      Alert.alert("Permission Error", "Please enable access to audio files.");
    }
  };

  const startRecording = async () => {
    const permission = await Audio.requestPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Permission needed", "Microphone access is required.");
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY,
      (status) => setRecordingDuration(status.durationMillis || 0)
    );

    setRecording(recording);
    setIsRecording(true);
    setRecordingDuration(0);
    isRecordingRef.current = true; // 🔐 start guard
  };

  const stopRecording = async () => {
    if (!isRecordingRef.current || !recording) return; // 🔐 avoid duplicate call

    isRecordingRef.current = false; // ⛔ prevent re-entry

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      const durationSec = Math.floor(recordingDuration / 1000);
      const formattedDuration = `${Math.floor(durationSec / 60)}:${("0" + (durationSec % 60)).slice(-2)}`;

      const newMessage = {
        id: Date.now(),
        text: "Voice message",
        sender: "me",
        time: getCurrentTime(),
        status: "sent",
        audio: uri,
        audioDuration: formattedDuration,
      };

      setMessages((prev) => [...prev, newMessage]);

      setIsRecording(false);
      setRecording(null);
      setRecordingDuration(0);
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  };

  const formatMillis = (millis) => {
    if (!millis) return "0:00";
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    return () => {
      if (currentPlayingSoundRef.current) {
        currentPlayingSoundRef.current.unloadAsync();
      }
    };
  }, []);

  const requestCallPermissions = async () => {
    const { status: cameraStatus } =
      await Camera.requestCameraPermissionsAsync();
    const { status: audioStatus } = await Audio.requestPermissionsAsync();

    if (cameraStatus !== "granted" || audioStatus !== "granted") {
      Alert.alert(
        "Permissions Required",
        "Camera and microphone access is needed for calls."
      );
      return false;
    }
    return true;
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === "me";
    const isSelected = selectedMessages.includes(item.id);
    const fileExtension = item.text?.split(".").pop();

    return (
      <TouchableOpacity
        onLongPress={() => handleLongPress(item)}
        onPress={() => {
          if (selectedMessages.length > 0) toggleMessageSelection(item.id);
        }}
        activeOpacity={0.8}
        className={`my-2 px-3 ${isMe ? "items-end" : "items-start"}`}
      >
        <View
          className={`relative px-4 py-3 max-w-[80%] rounded-2xl shadow-sm ${
            isMe && item.text
              ? "bg-blue-500 rounded-br-none"
              : isMe
                ? "bg-transparent rounded-br-none"
                : "bg-gray-100 rounded-bl-none"
          } ${isSelected ? "border-2 border-blue-400 bg-blue-100" : ""}`}
        >
          {/* ✅ Selected Check Icon */}
          {isSelected && (
            <View className="absolute -top-2 -left-2 bg-white rounded-full p-1 border border-blue-400 z-10">
              <Feather name="check" size={14} color="blue" />
            </View>
          )}

          {item.audio && (
            <View className="bg-white rounded-lg p-3 mb-2 w-64 shadow-sm">
              <View className="flex-row items-center space-x-3">
                {/* ▶️ Play / Pause Button */}
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      if (playingMessageId === item.id) {
                        if (isPaused) {
                          await currentPlayingSoundRef.current?.playAsync();
                          setIsPaused(false);
                        } else {
                          await currentPlayingSoundRef.current?.pauseAsync();
                          setIsPaused(true);
                        }
                        return;
                      }

                      if (currentPlayingSoundRef.current) {
                        await currentPlayingSoundRef.current.stopAsync();
                        await currentPlayingSoundRef.current.unloadAsync();
                        currentPlayingSoundRef.current = null;
                      }

                      const { sound: newSound } = await Audio.Sound.createAsync(
                        { uri: item.audio },
                        { shouldPlay: true },
                        (status) => setPlaybackStatus(status)
                      );

                      newSound.setOnPlaybackStatusUpdate(async (status) => {
                        setPlaybackStatus(status);
                        if (status.didJustFinish) {
                          await newSound.stopAsync();
                          await newSound.unloadAsync();
                          currentPlayingSoundRef.current = null;
                          setPlayingMessageId(null);
                          setIsPaused(false);
                          setPlaybackStatus(null);
                        }
                      });

                      currentPlayingSoundRef.current = newSound;
                      setPlayingMessageId(item.id);
                      setIsPaused(false);
                    } catch (error) {
                      console.error("Audio playback error:", error);
                    }
                  }}
                >
                  <Ionicons
                    name={
                      playingMessageId === item.id && !isPaused
                        ? "pause"
                        : "play"
                    }
                    size={24}
                    color="#4b5563"
                  />
                </TouchableOpacity>

                {/* 🎧 Progress + Time */}
                <View className="flex-1">
                  {/* Progress Bar */}
                  <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <View
                      className="h-2 bg-blue-500"
                      style={{
                        width:
                          playbackStatus?.isLoaded &&
                          playbackStatus?.positionMillis &&
                          playbackStatus?.durationMillis
                            ? `${
                                (playbackStatus.positionMillis /
                                  playbackStatus.durationMillis) *
                                100
                              }%`
                            : "0%",
                      }}
                    />
                  </View>

                  {/* Duration */}
                  <View className="flex-row justify-between mt-1 px-1">
                    <Text className="text-[10px] text-gray-500">
                      {formatMillis(playbackStatus?.positionMillis)}
                    </Text>
                    <Text className="text-[10px] text-gray-500">
                      {formatMillis(playbackStatus?.durationMillis)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* 📄 File Message */}
          {item.file && (
            <TouchableOpacity
              onPress={async () => {
                const info = await FileSystem.getInfoAsync(item.file);
                if (info.exists) {
                  await Sharing.shareAsync(item.file);
                } else {
                  Alert.alert("File not found", "This file may be deleted.");
                }
              }}
              className="p-2 rounded-lg bg-white flex-row items-center space-x-2 mb-2"
            >
              <MaterialCommunityIcons
                name="file-document-outline"
                size={24}
                color="#4b5563"
              />
              <View>
                <Text
                  className="text-sm font-medium text-gray-800"
                  numberOfLines={1}
                >
                  {item.text}
                </Text>
                <Text className="text-xs text-gray-500">
                  {fileExtension?.toUpperCase()} • Tap to open
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* 📝 Text Message */}
          {item.image && (
            <Image
              source={{ uri: item.image }}
              style={{
                width: 200,
                height: 200,
                borderRadius: 12,
                marginBottom: item.text ? 6 : 0,
              }}
              resizeMode="cover"
            />
          )}

          {item.text && (
            <Text
              className={`text-base leading-relaxed ${
                isMe ? "text-white" : "text-gray-800"
              }`}
            >
              {item.text}
            </Text>
          )}

          {item.video && (
            <Video
              ref={(ref) => {
                if (ref) item.videoRef = ref;
              }}
              source={{ uri: item.video }}
              style={{
                width: 200,
                height: 200,
                borderRadius: 10,
                marginTop: 5,
              }}
              useNativeControls
              resizeMode="contain"
              shouldPlay={false}
              onLoad={() => {
                item.videoRef?.setIsLoopingAsync(false);
              }}
              onPlaybackStatusUpdate={(status) => {
                if (status.didJustFinish && !status.isLooping) {
                  item.videoRef?.setPositionAsync(0, false); // 👈 Reset to beginning
                }
              }}
            />
          )}
          {/* 🕒 Timestamp & Status */}
          <View className="flex-row justify-end items-center gap-1 mt-1">
            <Text
              className={`text-xs ${isMe ? "text-white/80" : "text-gray-500"}`}
            >
              {item.time}
            </Text>
            {isMe && (
              <Text className="text-xs ml-1 text-white/80">
                {item.status === "seen" ? "✅" : "✔️"}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            {/* Message select and delet UI UX */}
            {selectedMessages.length > 0 && (
              <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-md rounded-b-xl mx-2 mt-2">
                <Text className="text-gray-800 font-semibold text-base">
                  {selectedMessages.length} selected
                </Text>

                <View className="flex-row items-center gap-2 space-x-3">
                  {selectedMessages.length === 1 && (
                    <TouchableOpacity
                      onPress={() => {
                        const selectedMsg = messages.find(
                          (msg) => msg.id === selectedMessages[0]
                        );
                        if (selectedMsg) {
                          setMessageText(selectedMsg.text);
                          setEditingMessageId(selectedMsg.id);
                          setSelectedMessages([]);
                        }
                      }}
                      className="p-2 rounded-full bg-gray-100 active:bg-gray-200"
                    >
                      <Feather name="edit-2" size={20} color="#1f2937" />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={deleteSelectedMessages}
                    className="p-2 rounded-full bg-red-100 active:bg-red-200"
                  >
                    <Feather name="trash-2" size={22} color="red" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={cancelSelection}
                    className="p-2 rounded-full bg-gray-100 active:bg-gray-200"
                  >
                    <Feather name="x" size={22} color="#374151" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Header UI UX */}
            <View className="py-4 px-4 bg-white border-b border-gray-200 shadow-sm">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center space-x-3 gap-2">
                  <FontAwesome6
                    onPress={() => router.back()}
                    name="arrow-left-long"
                    size={22}
                    color="#1f2937"
                  />

                  <TouchableOpacity
                    onPress={() =>
                      router.push(
                        "/screens/components/Otherprofile/FullProfileImage"
                      )
                    }
                  >
                    <Image
                      source={img}
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 9999,
                        borderWidth: 1,
                        borderColor: "#ccc",
                      }}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      router.push("screens/components/Otherprofile/Details")
                    }
                  >
                    <View>
                      <Text className="text-gray-800 font-semibold text-base">
                        Aman Verma
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        Last seen 10:59am
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <View className="flex-row space-x-4 gap-2">
                  <TouchableOpacity
                    onPress={async () => {
                      const granted = await requestCallPermissions();
                      if (granted) {
                        router.push("/screens/pages/AudioCallScreen");
                      }
                    }}
                  >
                    <Ionicons name="call" size={22} color="#374151" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={async () => {
                      const granted = await requestCallPermissions();
                      if (granted) {
                        router.push("/VideoCallScreen");
                      }
                    }}
                  >
                    <Ionicons name="videocam" size={22} color="#374151" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setDropdownVisible(!dropdownVisible)}
                  >
                    <Entypo
                      name="dots-three-vertical"
                      size={20}
                      color="#374151"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {dropdownVisible && (
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => setDropdownVisible(false)}
                className="absolute inset-0 z-30"
              >
                <View className="absolute top-24 right-4 bg-white rounded-lg shadow-lg w-48 border border-gray-100 p-2 z-40">
                  {/* ✅ Updated Wallpaper Selector */}
                  <WallPaper
                    onWallpaperSelected={(uri) => {
                      setWallpaperUri(uri);
                      setDropdownVisible(false);
                    }}
                  />

                  <TouchableOpacity
                    onPress={() => {
                      setDropdownVisible(false);
                      router.push("/screens/pages/Settings");
                    }}
                    className="py-2 px-3"
                  >
                    <Text className="text-gray-800 text-sm">Settings</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setDropdownVisible(false);
                      Alert.alert(
                        "Block Contact",
                        "Are you sure you want to block this contact?",
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Block",
                            style: "destructive",
                            onPress: () => {
                              setIsBlocked(true);
                            },
                          },
                        ]
                      );
                    }}
                    className="py-2 px-3"
                  >
                    <Text className="text-red-500 text-sm">Block Contact</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}

            {/* Messages UI UX */}
            {wallpaperUri ? (
              <ImageBackground
                source={{ uri: wallpaperUri }}
                style={{ flex: 1 }}
                resizeMode="cover"
              >
                <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                  <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
                  />
                </Animated.View>
              </ImageBackground>
            ) : (
              <View className="flex-1 bg-gradient-to-b from-white to-blue-50">
                <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                  <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
                  />
                </Animated.View>
              </View>
            )}

            {/* Input & Attachments UI UX */}
            {isBlocked ? (
              <BlockedOverlay
                onUnblock={() => setIsBlocked(false)}
                onDelete={() => {
                  setMessages([]);
                  setIsBlocked(true);
                }}
              />
            ) : (
              <View className="absolute bottom-0 left-0 right-0 bg-white px-4 pt-2 pb-3 border-t border-gray-200">
                {attachedFile && (
                  <View className="mb-2 bg-gray-100 p-2 rounded-xl flex-row items-center justify-between">
                    <Text className="text-sm text-gray-700" numberOfLines={1}>
                      📎 {attachedFile.name || "Attachment"}
                    </Text>
                    <TouchableOpacity onPress={() => setAttachedFile(null)}>
                      <Feather name="x" size={20} color="#555" />
                    </TouchableOpacity>
                  </View>
                )}
                <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
                  <TouchableOpacity
                    onPress={() => setAttachmentOptionsVisible(true)}
                    className="mr-2"
                  >
                    <Feather name="paperclip" size={22} color="#555" />
                  </TouchableOpacity>
                  <TextInput
                    className="flex-1 text-gray-800 px-2"
                    placeholder="Type a message..."
                    value={messageText}
                    onChangeText={setMessageText}
                    onSubmitEditing={handleSend}
                    returnKeyType="send"
                  />
                  {messageText.trim() === "" && !attachedFile ? (
                    <TouchableOpacity
                      onPressIn={startRecording}
                      onPressOut={stopRecording}
                    >
                      <MaterialCommunityIcons
                        name={isRecording ? "microphone-off" : "microphone"}
                        size={22}
                        color={isRecording ? "red" : "#3b82f6"}
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={handleSend}>
                      <Feather name="send" size={22} color="#3b82f6" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Attachment Dropdown UI UX */}
            {attachmentOptionsVisible && (
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => setAttachmentOptionsVisible(false)}
                className="absolute inset-0 z-20"
              >
                <View className="absolute bottom-24 right-4 bg-white rounded-2xl shadow-2xl p-4 w-56 space-y-4 border border-gray-100">
                  <Text className="text-center text-gray-700 font-semibold text-sm">
                    Send Attachment
                  </Text>

                  <View className="flex flex-wrap flex-row justify-between">
                    <TouchableOpacity
                      onPress={pickCamera}
                      className="items-center w-[30%] mb-4"
                    >
                      <View className="w-14 h-14 bg-blue-100 rounded-full justify-center items-center mb-1">
                        <Feather name="camera" size={22} color="#2563eb" />
                      </View>
                      <Text className="text-xs text-center text-gray-700">
                        Camera
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={pickImage}
                      className="items-center w-[30%] mb-4"
                    >
                      <View className="w-14 h-14 bg-green-100 rounded-full justify-center items-center mb-1">
                        <Feather name="image" size={22} color="#059669" />
                      </View>
                      <Text className="text-xs text-center text-gray-700">
                        Gallery
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={pickDocument}
                      className="items-center w-[30%] mb-4"
                    >
                      <View className="w-14 h-14 bg-yellow-100 rounded-full justify-center items-center mb-1">
                        <Feather name="file-text" size={22} color="#d97706" />
                      </View>
                      <Text className="text-xs text-center text-gray-700">
                        Document
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={pickVideo}
                      className="items-center w-[30%] mb-4"
                    >
                      <View className="w-14 h-14 bg-red-100 rounded-full justify-center items-center mb-1">
                        <Feather name="video" size={22} color="#dc2626" />
                      </View>
                      <Text className="text-xs text-center text-gray-700">
                        Video
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={pickAudio}
                      className="items-center w-[30%] mb-2"
                    >
                      <View className="w-14 h-14 bg-purple-100 rounded-full justify-center items-center mb-1">
                        <Feather name="music" size={22} color="#9333ea" />
                      </View>
                      <Text className="text-xs text-center text-gray-700">
                        Audio
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Message;

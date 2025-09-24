import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  Alert,
  Modal,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import * as Audio from "expo-av";
import * as Camera from "expo-camera";
import WallPaper from "../ChangeWallPaper/WallPaper";
import { format, isToday } from "date-fns";
import { useDispatch } from "react-redux";
import { setOnlineUsers } from "../../../redux/features/auth";

const OneToOneChatHeader = ({
  user,
  onWallpaperChange,
  onBlock,
  onClearChat,
}) => {
  const router = useRouter();
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [wallpaperModalVisible, setWallpaperModalVisible] = useState(false);

  console.log("Onlinedata", user);

  const requestAudioPermissionAndCall = async () => {
    setIsRequestingPermission(true);
    const { status } = await Audio.Audio.requestPermissionsAsync();
    setIsRequestingPermission(false);

    if (status === "granted") {
      router.push("/screens/pages/AudioCallScreen");
    } else {
      Alert.alert(
        "Permission required",
        "Microphone permission is needed to make audio calls.",
        [{ text: "OK" }]
      );
    }
  };

  const formattedLastSeen = user?.lastSeen
    ? isToday(new Date(user.lastSeen))
      ? `Today at ${format(new Date(user.lastSeen), "hh:mm a")}`
      : format(new Date(user.lastSeen), "dd MMM yyyy, hh:mm a")
    : null;
  const requestCameraPermissionAndCall = async () => {
    const { status } = await Camera.Camera.requestCameraPermissionsAsync();

    if (status === "granted") {
      router.push("/app/VideoCallScreen");
    } else {
      Alert.alert(
        "Permission required",
        "Camera permission is needed to make video calls.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <>
      <LinearGradient
        colors={["#4f8ef7", "#2563eb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-b-[20px]"
      >
        <BlurView intensity={60} tint="light" className="px-4 py-3.5">
          <View className="flex-row items-center justify-between">
            {/* Left: Back + User Info */}
            <View className="flex-row items-center space-x-3 gap-2">
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.7}
                className="p-2 rounded-full bg-white/20"
              >
                <Ionicons name="arrow-back" size={20} color="white" />
              </TouchableOpacity>

              <View className="flex-row items-center">
                <Image
                  source={
                    user?.image
                      ? { uri: user.image }
                      : require("../../../../assets/images/userDp.png")
                  }
                  className="w-10 h-10 rounded-full mr-3 border border-white/30"
                />

                <TouchableOpacity
                  onPress={() => router.push({
                    pathname: "/screens/pages/ProfileEdit",
                    params: { user: JSON.stringify(user) },

                  })}
                >
                  <View>
                    <Text className="text-white font-semibold text-lg leading-tight">
                      {user?.name}
                    </Text>
                    <Text className="text-white/70 text-xs mt-0.5">
                      {user?.isOnline === "active"
                        ? "Online"
                        : formattedLastSeen
                          ? ` ${formattedLastSeen}`
                          : "Offline"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Right: Audio Call, Video Call, Menu */}
            <View className="flex-row items-center space-x-4 gap-2">
              <TouchableOpacity
                onPress={requestAudioPermissionAndCall}
                activeOpacity={0.7}
                className="p-2 rounded-full bg-white/25 shadow-md"
                disabled={isRequestingPermission}
              >
                <MaterialCommunityIcons
                  name="phone-outline"
                  size={20}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={requestCameraPermissionAndCall}
                activeOpacity={0.7}
                className="p-2 rounded-full bg-white/25 shadow-md"
              >
                <MaterialCommunityIcons
                  name="video-outline"
                  size={20}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setMenuVisible(!menuVisible)}
                className="p-2 rounded-full bg-white/15 shadow-sm"
              >
                <MaterialCommunityIcons
                  name="dots-vertical"
                  size={18}
                  color="white"
                />
              </TouchableOpacity>

              {menuVisible && (
                <View
                  className="absolute top-12 right-0 z-10 bg-white rounded-lg shadow-lg"
                  style={{ minWidth: 180 }}
                >
                  <TouchableOpacity
                    className="px-4 py-3 border-b border-gray-200"
                    onPress={() => {
                      setWallpaperModalVisible(true);
                      setMenuVisible(false);
                    }}
                  >
                    <Text className="text-gray-800">Change Wallpaper</Text>
                  </TouchableOpacity>

                  <TouchableOpacity className="px-4 py-3 border-b border-gray-200">
                    <Text className="text-gray-800">Settings</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="px-4 py-3 border-b border-gray-200"
                    onPress={() => {
                      onClearChat();
                      setMenuVisible(false);
                    }}
                  >
                    <Text className="text-gray-800">Clear Chat</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="px-4 py-3"
                    onPress={() => {
                      onBlock();
                      setMenuVisible(false);
                    }}
                  >
                    <Text className="text-red-600">Block</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </BlurView>
      </LinearGradient>

      {/* Wallpaper Modal */}
      <Modal visible={wallpaperModalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-center bg-black/50 px-4">
          <View className="bg-white rounded-xl p-4">
            <Text className="text-lg font-semibold mb-3">
              Change Chat Wallpaper
            </Text>
            <WallPaper
              onWallpaperSelected={(uri) => {
                onWallpaperChange(uri);
                setWallpaperModalVisible(false);
              }}
            />
            <TouchableOpacity
              onPress={() => setWallpaperModalVisible(false)}
              className="mt-4 p-2 bg-gray-200 rounded-lg"
            >
              <Text className="text-center">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default OneToOneChatHeader;

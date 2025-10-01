import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  Alert,
  Modal,
} from "react-native";
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import {  useRouter } from "expo-router";
import * as Audio from "expo-av";
import dp from "../../../../assets/images/dp.jpg";
import * as Camera from "expo-camera";
import WallPaper from "../ChangeWallPaper/WallPaper";

const GroupChatHeader = ({
  onWallpaperChange,
  onBlock,
  onClearChat,
  onLeaveGroup,
  GroupDetails,
}) => {
  const router = useRouter();
  // console.log(GroupDetails,"GroupDetails");
  
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [wallpaperModalVisible, setWallpaperModalVisible] = useState(false);
console.log(GroupDetails,"GroupDetails");

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
  const goToGroupProfile = () => {
    router.push({
      pathname: "/screens/pages/GroupProfile",
      params: { GroupDetails: JSON.stringify(GroupDetails) },
    });
  };

  return (
  <>
  <LinearGradient
    colors={["#4f8ef7", "#2563eb"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    className="rounded-b-[24px]" // slightly bigger rounding
  >
    <BlurView intensity={70} tint="light" className="px-5 py-3">
      <View className="flex-row items-center justify-between">
        {/* Left: Back + Group Info */}
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="p-2 rounded-full bg-white/25"
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goToGroupProfile}
            activeOpacity={0.85}
            className="flex-row items-center gap-3"
          >
            {GroupDetails.groupImage ? (
              <Image
                source={{ uri: GroupDetails.groupImage }}
                className="w-14 h-14 rounded-full border border-white/30"
                style={{
                  shadowColor: "#000",
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 3, // Android shadow
                }}
              />
            ) : (
              <FontAwesome5
                name="users"
                size={32}
                color="white"
                style={{
                  backgroundColor: "#3b82f6",
                  padding: 10,
                  borderRadius: 32,
                }}
              />
            )}

            <View className="justify-center">
              <Text className="text-white font-semibold text-lg">
                {GroupDetails?.name || "Group Name"}
              </Text>
              <Text className="text-white/70 text-xs mt-0.5">
                {GroupDetails?.active_members ?? 0} Members
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Right: Audio, Video, Menu */}
        <View className="flex-row items-center gap-3 relative">
          <TouchableOpacity
            onPress={requestAudioPermissionAndCall}
            activeOpacity={0.7}
            className="p-3 rounded-full bg-white/25 shadow-md"
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
            className="p-3 rounded-full bg-white/25 shadow-md"
          >
            <MaterialCommunityIcons
              name="video-outline"
              size={20}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMenuVisible(!menuVisible)}
            activeOpacity={0.8}
            className="p-3 rounded-full bg-white/15 shadow-sm"
          >
            <MaterialCommunityIcons
              name="dots-vertical"
              size={20}
              color="white"
            />
          </TouchableOpacity>

          {/* Menu */}
          {menuVisible && (
            <View
              className="absolute top-14 right-0 z-20 bg-white rounded-xl shadow-lg"
              style={{ minWidth: 180 }}
            >
              <TouchableOpacity
                className="px-4 py-3 border-b border-gray-200"
                onPress={() => {
                  setWallpaperModalVisible(true);
                  setMenuVisible(false);
                }}
              >
                <Text className="text-gray-800 font-medium">Change Wallpaper</Text>
              </TouchableOpacity>

              <TouchableOpacity className="px-4 py-3 border-b border-gray-200">
                <Text className="text-gray-800 font-medium">Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="px-4 py-3 border-b border-gray-200"
                onPress={() => {
                  onClearChat();
                  setMenuVisible(false);
                }}
              >
                <Text className="text-gray-800 font-medium">Clear Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="px-4 py-3 border-b border-gray-200"
                onPress={() => {
                  onBlock();
                  setMenuVisible(false);
                }}
              >
                <Text className="text-red-600 font-semibold">Block</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="px-4 py-3"
                onPress={() => {
                  onLeaveGroup?.();
                  setMenuVisible(false);
                }}
              >
                <Text className="text-red-600 font-semibold">Leave Group</Text>
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
      <View className="bg-white rounded-xl p-5">
        <Text className="text-lg font-semibold mb-3">Change Chat Wallpaper</Text>
        <WallPaper
          onWallpaperSelected={(uri) => {
            onWallpaperChange(uri);
            setWallpaperModalVisible(false);
          }}
        />
        <TouchableOpacity
          onPress={() => setWallpaperModalVisible(false)}
          className="mt-4 p-3 bg-gray-200 rounded-lg"
        >
          <Text className="text-center font-medium">Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
</>

  );
};

export default GroupChatHeader;

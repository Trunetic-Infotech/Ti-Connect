import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons, Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const AudioCallScreen = () => {
  const navigation = useNavigation();
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((sec % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const endCall = () => {
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-gray-900 justify-center items-center px-4">
      <Text className="text-gray-400 text-base mb-2">In Call with</Text>

      <View className="w-40 h-40 rounded-full bg-gray-800 justify-center items-center mb-5">
        <Image
          source={require("../../../assets/images/dp.jpg")}
          className="w-36 h-36 rounded-full"
        />
      </View>

      <Text className="text-white text-xl font-semibold mb-1">Aman Verma</Text>
      <Text className="text-gray-400 text-base mb-10">
        {formatTime(duration)}
      </Text>

      <View className="flex-row justify-between w-full px-10 mb-20">
        <TouchableOpacity
          onPress={() => setIsMuted(!isMuted)}
          className="items-center"
        >
          <Ionicons
            name={isMuted ? "mic-off" : "mic"}
            size={28}
            color="white"
          />
          <Text className="text-white text-xs mt-1">
            {isMuted ? "Unmute" : "Mute"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsSpeakerOn(!isSpeakerOn)}
          className="items-center"
        >
          <MaterialIcons
            name={isSpeakerOn ? "volume-up" : "volume-mute"}
            size={28}
            color="white"
          />
          <Text className="text-white text-xs mt-1">
            {isSpeakerOn ? "Speaker" : "Earpiece"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <Entypo name="dial-pad" size={28} color="white" />
          <Text className="text-white text-xs mt-1">Dialpad</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="bg-red-600 p-5 rounded-full absolute bottom-10"
        onPress={endCall}
      >
        <Ionicons name="call" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default AudioCallScreen;

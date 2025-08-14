import { Audio } from "expo-av";
import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function VoicePlayer({ uri, duration }) {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const togglePlay = async () => {
    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      if (!sound) {
        const { sound: newSound } = await Audio.Sound.createAsync({ uri });
        setSound(newSound);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setProgress(status.positionMillis / status.durationMillis);

            if (status.didJustFinish) {
              setIsPlaying(false);
              setProgress(0);

              // Reset sound so user can play again
              newSound.unloadAsync();
              setSound(null);
            }
          }
        });

        await newSound.playAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(true);
    }
  };

  return (
    <View className="flex-row items-center p-2 bg-gray-200 rounded-lg min-w-[150px]">
      <TouchableOpacity onPress={togglePlay} className="mr-2">
        <Feather
          name={isPlaying ? "pause" : "play"}
          size={24}
          color="#2563eb"
        />
      </TouchableOpacity>

      <View className="flex-1 h-1 flex-row rounded overflow-hidden mr-2 bg-gray-300">
        <View className="bg-blue-600 h-1" style={{ flex: progress }} />
        <View className="bg-gray-300 h-1" style={{ flex: 1 - progress }} />
      </View>

      <Text className="text-xs text-gray-900">{duration}s</Text>
    </View>
  );
}

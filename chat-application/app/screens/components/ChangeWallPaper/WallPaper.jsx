import React, { useEffect, useState } from "react";
import {
  Text,
  Alert,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, MaterialIcons } from "@expo/vector-icons";

const WallPaper = ({ onWallpaperSelected }) => {
  const [wallpaperExists, setWallpaperExists] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWallpaper = async () => {
      const uri = await AsyncStorage.getItem("chat_wallpaper");
      setWallpaperExists(!!uri);
      setLoading(false);
    };
    loadWallpaper();
  }, []);

  const pickWallpaper = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow gallery access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;
      await AsyncStorage.setItem("chat_wallpaper", uri);
      setWallpaperExists(true);
      onWallpaperSelected(uri);
    }
  };

  const removeWallpaper = async () => {
    await AsyncStorage.removeItem("chat_wallpaper");
    setWallpaperExists(false);
    onWallpaperSelected(null); // Notify parent
  };

  if (loading) {
    return (
      <View className="py-2 px-3">
        <ActivityIndicator size="small" color="#6b7280" />
      </View>
    );
  }

  return (
    <View>
      {/* Change Wallpaper */}
      <TouchableOpacity
        onPress={pickWallpaper}
        className="py-2 px-3 flex-row items-center"
      >
        <Feather name="image" size={18} color="#374151" />
        <Text className="ml-2 text-gray-800 text-sm">Change Wallpaper</Text>
      </TouchableOpacity>

      {/* Remove Wallpaper (only if exists) */}
      {wallpaperExists && (
        <TouchableOpacity
          onPress={removeWallpaper}
          className="py-2 px-3 flex-row items-center"
        >
          <MaterialIcons
            name="remove-circle-outline"
            size={18}
            color="#dc2626"
          />
          <Text className="ml-2 text-red-500 text-sm">Remove Wallpaper</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default WallPaper;

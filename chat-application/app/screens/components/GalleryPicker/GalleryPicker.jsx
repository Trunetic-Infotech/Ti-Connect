import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";

const GalleryPicker = ({ visible, onSend, onClose }) => {
  const [selectedImages, setSelectedImages] = useState([]);

  const openGallery = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Gallery permission is required to select a photo."
        );
        onClose?.();
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true, // MULTIPLE SELECT ENABLED
      });

      if (!result.canceled) {
        setSelectedImages(result.assets.map((a) => a.uri));
      } else {
        onClose?.();
      }
    } catch (error) {
      console.log("Gallery Error:", error);
      onClose?.();
    }
  };

  useEffect(() => {
    if (visible) {
      setSelectedImages([]);
      openGallery();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/90 justify-center items-center px-4">
        {selectedImages.length > 0 ? (
          <>
            {/* Preview All Selected Images */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ maxHeight: "70%" }}
              contentContainerStyle={{ alignItems: "center" }}
            >
              {selectedImages.map((uri, index) => (
                <Image
                  key={index}
                  source={{ uri }}
                  style={{
                    width: 250,
                    height: 350,
                    marginHorizontal: 8,
                    borderRadius: 12,
                    resizeMode: "cover",
                  }}
                />
              ))}
            </ScrollView>

            {/* Buttons */}
            <View className="flex-row justify-between w-full mt-6">
              {/* Cancel Button */}
              <TouchableOpacity
                onPress={onClose}
                className="bg-red-500 px-6 py-3 rounded-full flex-row items-center"
              >
                <Feather name="x" size={20} color="white" />
                <Text className="text-white ml-2 font-medium">Cancel</Text>
              </TouchableOpacity>

              {/* Send Button */}
              <TouchableOpacity
                onPress={() => {
                  selectedImages.forEach((uri) => {
                    onSend?.({ type: "image", uri });
                  });
                  onClose?.();
                }}
                className="bg-blue-500 px-6 py-3 rounded-full flex-row items-center"
              >
                <Feather name="send" size={20} color="white" />
                <Text className="text-white ml-2 font-medium">Send</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text className="text-white text-lg">Opening Gallery...</Text>
        )}
      </View>
    </Modal>
  );
};

export default GalleryPicker;

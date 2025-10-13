import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { WebView } from "react-native-webview";

const { width, height } = Dimensions.get("window");

const DocumentViewer = ({ uri }) => {
  const [visible, setVisible] = useState(false);
  const fileName = uri?.split("/").pop() || "Document.pdf";

  return (
    <View>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        className="flex-row items-center bg-gray-100 p-3 rounded-2xl my-1"
      >
        <Feather name="file-text" size={28} color="#555" />
        <View className="ml-2 flex-1">
          <Text className="font-semibold text-gray-800" numberOfLines={1}>
            {fileName}
          </Text>
          <Text className="text-xs text-gray-500">Tap to view</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
        <View className="flex-1 bg-black">
          <TouchableOpacity
            onPress={() => setVisible(false)}
            className="absolute top-10 right-5 z-10 bg-white p-2 rounded-full"
          >
            <Feather name="x" size={22} color="black" />
          </TouchableOpacity>

          <WebView
            source={{ uri }}
            style={{ flex: 1, width, height }}
            startInLoadingState
          />
        </View>
      </Modal>
    </View>
  );
};

export default DocumentViewer;

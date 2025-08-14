// components/DocumentPicker/DocumentPicker.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Feather } from "@expo/vector-icons";

const DocumentPickerModal = ({ visible, onSend, onClose }) => {
  const [selectedDocs, setSelectedDocs] = useState([]);

  const openDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
        copyToCacheDirectory: true, // ensures local file access
      });

      if (result.type === "cancel") {
        onClose?.();
        return;
      }

      // New expo-document-picker returns single object when multiple: false, and array when true
      let docsArray =
        result.assets || (Array.isArray(result) ? result : [result]);

      // Limit to 5
      if (docsArray.length > 5) {
        Alert.alert("Limit Exceeded", "You can only select up to 5 documents.");
        docsArray = docsArray.slice(0, 5);
      }

      setSelectedDocs(docsArray);
    } catch (error) {
      console.log("Document Picker Error:", error);
      onClose?.();
    }
  };

  useEffect(() => {
    if (visible) {
      setSelectedDocs([]);
      openDocumentPicker();
    }
  }, [visible]);

  const formatFileSize = (size) => {
    if (!size) return "Unknown size";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/90 justify-center items-center px-4">
        {selectedDocs.length > 0 ? (
          <>
            {/* Document Preview */}
            <ScrollView
              style={{ maxHeight: "70%" }}
              contentContainerStyle={{ paddingVertical: 10 }}
            >
              {selectedDocs.map((doc, index) => (
                <View
                  key={index}
                  className="flex-row items-center bg-white rounded-lg p-3 mb-3"
                  style={{ width: 300 }}
                >
                  <Feather name="file-text" size={20} color="#333" />
                  <View className="ml-3 flex-1">
                    <Text
                      className="text-sm font-medium text-gray-800"
                      numberOfLines={1}
                    >
                      {doc.name}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {formatFileSize(doc.size)}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Buttons */}
            <View className="flex-row justify-between w-full mt-4 px-6">
              {/* Cancel */}
              <TouchableOpacity
                onPress={onClose}
                className="bg-red-500 px-6 py-3 rounded-full flex-row items-center"
              >
                <Feather name="x" size={20} color="white" />
                <Text className="text-white ml-2 font-medium">Cancel</Text>
              </TouchableOpacity>

              {/* Send */}
              <TouchableOpacity
                onPress={() => {
                  selectedDocs.forEach((doc) => {
                    onSend?.({
                      id: Date.now().toString(),
                      type: "document",
                      uri: doc.uri,
                      name: doc.name,
                      size: doc.size,
                      time: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                    });
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
          <Text className="text-white text-lg">Opening Documents...</Text>
        )}
      </View>
    </Modal>
  );
};

export default DocumentPickerModal;

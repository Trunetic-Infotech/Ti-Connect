import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import CameraPicker from "../CameraPicker/CameraPicker";
import GalleryPicker from "../GalleryPicker/GalleryPicker";
import DocumentPickerModal from "../DocumentPicker/DocumentPicker";
import VideoPicker from "../VideoPicker/VideoPicker";
import AudioPicker from "../AudioPicker/AudioPicker";
import useVoiceRecorder from "../VoiceRecorder/VoiceRecorder";

const SendMessageBar = ({ messageText, setMessageText, onSend }) => {
  const [attachmentOptionsVisible, setAttachmentOptionsVisible] =
    useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(false);
  const { recording, startRecording, stopRecording } = useVoiceRecorder();

  const handleSendPress = () => {
    if (!messageText.trim()) return;
    onSend({ type: "text", text: messageText.trim() });
    setAttachmentOptionsVisible(false);
  };

  const handleOutsidePress = () => {
    if (attachmentOptionsVisible) setAttachmentOptionsVisible(false);
  };

  const handleMicPress = async () => {
    if (!recording) {
      // Start recording
      await startRecording();
    } else {
      // Stop recording and send
      const voiceMessage = await stopRecording();
      if (voiceMessage) {
        onSend(voiceMessage);
      }
    }
  };

  return (
    <View className="bg-white border-t border-gray-200 p-2.5">
      {attachmentOptionsVisible && (
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
          <View className="absolute inset-0 z-20" />
        </TouchableWithoutFeedback>
      )}

      {attachmentOptionsVisible && (
        <View className="absolute bottom-16 right-4 bg-white rounded-2xl shadow-2xl p-4 w-56 space-y-4 border border-gray-100 z-30">
          <Text className="text-center text-gray-700 font-semibold text-sm">
            Send Attachment
          </Text>

          <View className="flex flex-wrap flex-row justify-between">
            {/* 📸 Camera */}
            <TouchableOpacity
              className="items-center w-[30%] mb-4"
              onPress={() =>
                CameraPicker((imageMessage) => {
                  onSend(imageMessage);
                  setAttachmentOptionsVisible(false);
                })
              }
            >
              <View className="w-14 h-14 bg-blue-100 rounded-full justify-center items-center mb-1">
                <Feather name="camera" size={22} color="#2563eb" />
              </View>
              <Text className="text-xs text-center text-gray-700">Camera</Text>
            </TouchableOpacity>

            {/* Gallery */}
            <TouchableOpacity
              className="items-center w-[30%] mb-4"
              onPress={() => setGalleryVisible(true)}
            >
              <View className="w-14 h-14 bg-green-100 rounded-full justify-center items-center mb-1">
                <Feather name="image" size={22} color="#059669" />
              </View>
              <Text className="text-xs text-center text-gray-700">Gallery</Text>
            </TouchableOpacity>

            <GalleryPicker
              visible={galleryVisible}
              onSend={(imageMessage) => {
                onSend(imageMessage);
              }}
              onClose={() => setGalleryVisible(false)}
            />

            {/* Document */}
            <TouchableOpacity
              className="items-center w-[30%] mb-4"
              onPress={() => setDocumentVisible(true)}
            >
              <View className="w-14 h-14 bg-yellow-100 rounded-full justify-center items-center mb-1">
                <Feather name="file-text" size={22} color="#d97706" />
              </View>
              <Text className="text-xs text-center text-gray-700">
                Document
              </Text>
            </TouchableOpacity>

            <DocumentPickerModal
              visible={documentVisible}
              onSend={(docMessage) => {
                onSend(docMessage);
              }}
              onClose={() => setDocumentVisible(false)}
            />
            {/* Video Picker */}
            <TouchableOpacity
              className="items-center w-[30%] mb-4"
              onPress={() =>
                VideoPicker((videoMessage) => {
                  onSend(videoMessage);
                  setAttachmentOptionsVisible(false);
                })
              }
            >
              <View className="w-14 h-14 bg-red-100 rounded-full justify-center items-center mb-1">
                <Feather name="video" size={22} color="#dc2626" />
              </View>
              <Text className="text-xs text-center text-gray-700">Video</Text>
            </TouchableOpacity>

            {/* Audio Picker */}
            <TouchableOpacity
              className="items-center w-[30%] mb-2"
              onPress={() =>
                AudioPicker((audioMessage) => {
                  onSend(audioMessage);
                  setAttachmentOptionsVisible(false);
                })
              }
            >
              <View className="w-14 h-14 bg-purple-100 rounded-full justify-center items-center mb-1">
                <Feather name="music" size={22} color="#9333ea" />
              </View>
              <Text className="text-xs text-center text-gray-700">Audio</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View className="flex-row items-center bg-white rounded-full px-4 py-2 shadow-md shadow-black/10">
        <TouchableOpacity
          className="p-2"
          onPress={() => setAttachmentOptionsVisible(!attachmentOptionsVisible)}
        >
          <Feather name="paperclip" size={22} color="#555" />
        </TouchableOpacity>

        <TextInput
          className="flex-1 text-base mx-2 text-[#111] py-1"
          placeholder="Type a message..."
          placeholderTextColor="#888"
          value={messageText}
          onChangeText={setMessageText}
          multiline
          onFocus={() => setAttachmentOptionsVisible(false)}
        />

        {messageText.trim() === "" ? (
          <TouchableOpacity onPress={handleMicPress}>
            <Feather
              name={recording ? "square" : "mic"}
              size={24}
              color="#3b82f6"
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleSendPress}
            className="p-2 rounded-full bg-blue-500"
          >
            <Feather name="send" size={18} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SendMessageBar;

// import React, { useState } from "react";
// import { View, Text, TouchableOpacity, Modal, Dimensions } from "react-native";
// import { Feather } from "@expo/vector-icons";
// import { WebView } from "react-native-webview";

// const { width, height } = Dimensions.get("window");

// const DocumentViewer = ({ uri }) => {
//   const [visible, setVisible] = useState(false);
//   const fileName = uri?.split("/").pop() || "Document.pdf";

//   return (
//     <View>
//       <TouchableOpacity
//         onPress={() => setVisible(true)}
//         className="flex-row items-center bg-gray-100 p-3 rounded-2xl my-1"
//       >
//         <Feather name="file-text" size={28} color="#555" />
//         <View className="ml-2 flex-1">
//           <Text className="font-semibold text-gray-800" numberOfLines={1}>
//             {fileName}
//           </Text>
//           <Text className="text-xs text-gray-500">Tap to view</Text>
//         </View>
//       </TouchableOpacity>

//       <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
//         <View className="flex-1 bg-black">
//           <TouchableOpacity
//             onPress={() => setVisible(false)}
//             className="absolute top-10 right-5 z-10 bg-white p-2 rounded-full"
//           >
//             <Feather name="x" size={22} color="black" />
//           </TouchableOpacity>

//           <WebView
//             source={{ uri }}
//             style={{ flex: 1, width, height }}
//             startInLoadingState
//           />
//         </View>
//       </Modal>
//     </View>
//   );
// };

// export default DocumentViewer;
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { WebView } from "react-native-webview";

const { width, height } = Dimensions.get("window");

const DocumentViewer = ({ uri, size = "470 KB", pages = "5 pages" }) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileName = uri?.split("/").pop() || "Document.pdf";

  return (
    <View className="w-full h-14 mb-4" >
      {/* WhatsApp-like Bubble */}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        activeOpacity={0.9}
        style={{
          backgroundColor: "#F3F4F6",
          borderRadius: 6,
          paddingVertical: 8,
          paddingHorizontal: 12,
          flexDirection: "row",
          alignItems: "center",
          marginVertical: 6,
        }}
      >
        {/* Left PDF Icon */}
        <View
          style={{
            width: 36,
            height: 36,
            backgroundColor: "#fff",
            borderRadius: 8,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#E5E7EB",
          }}
        >
          <Text style={{ color: "red", fontWeight: "bold", fontSize: 12 }}>PDF</Text>
        </View>

        {/* Right Details */}
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: "#1F2937",
            }}
            numberOfLines={1}
          >
            {fileName}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: "#6B7280",
              marginTop: 2,
            }}
          >
            {pages} · {size} · pdf
          </Text>
        </View>

        {/* Optional Share Icon */}
        <Feather name="share-2" size={18} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Fullscreen PDF Viewer */}
      <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          {/* Header */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "rgba(0,0,0,0.7)",
              paddingVertical: 12,
              paddingHorizontal: 16,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Feather name="file-text" size={20} color="#fff" />
              <Text
                style={{
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: "500",
                  marginLeft: 8,
                  maxWidth: width * 0.7,
                }}
                numberOfLines={1}
              >
                {fileName}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Feather name="x" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* PDF Viewer */}
          <WebView
            source={{ uri }}
            style={{ flex: 1, marginTop: 50 }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            startInLoadingState
          />

          {/* Loading Overlay */}
          {loading && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.4)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color="#2B6DF3" />
              <Text style={{ color: "#fff", fontSize: 12, marginTop: 8 }}>
                Loading document...
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default DocumentViewer;

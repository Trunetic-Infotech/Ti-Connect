// // components/CameraPicker/CameraPicker.jsx
// import React from "react";
// import { Alert } from "react-native";
// import * as ImagePicker from "expo-image-picker";

// const CameraPicker = async (onPicked) => {
//   try {
//     // Request permission
//     const { status } = await ImagePicker.requestCameraPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert(
//         "Permission Required",
//         "Camera permission is required to take a photo."
//       );
//       return;
//     }

//     // Open camera
//     const result = await ImagePicker.launchCameraAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       quality: 0.7,
//     });

//     // If cancelled
//     if (result.canceled) return;

//     // Return image to parent
//     if (onPicked) {
//       onPicked({
//         type: "image",
//         uri: result.assets[0].uri,
//       });
//     }
//   } catch (error) {
//     console.log("Camera Error:", error);
//   }
// };

// export default CameraPicker;


// components/CameraPicker/CameraPicker.jsx
import React from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

const CameraPicker = async (onPicked) => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera access is needed to take photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled) return;

    const image = result.assets?.[0];
    if (onPicked && image?.uri) {
      onPicked({
        type: "image",
        uri: image.uri,
      });
    }
  } catch (err) {
    console.error("Camera Error:", err);
  }
};

export default CameraPicker;










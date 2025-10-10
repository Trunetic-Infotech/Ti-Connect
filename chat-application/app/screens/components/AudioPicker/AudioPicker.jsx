// // components/AudioPicker/AudioPicker.js
// import * as DocumentPicker from "expo-document-picker";

// export default async function AudioPicker(onSend) {
//   try {
//     const result = await DocumentPicker.getDocumentAsync({
//       type: "audio/*", // only audio files
//       multiple: true, // allow selecting multiple
//       copyToCacheDirectory: true,
//     });

//     // If user cancels
//     if (!result.assets || result.assets.length === 0) return;

//     // Limit to 5 files
//     const selectedFiles = result.assets.slice(0, 5);

//     selectedFiles.forEach((file) => {
//       onSend({
//         type: "audio",
//         uri: file.uri,
//         name: file.name,
//         size: file.size,
//         mimeType: file.mimeType,
//       });
//     });
//   } catch (error) {
//     console.log("Audio picking error:", error);
//   }
// }

// components/AudioPicker/AudioPicker.js
import * as DocumentPicker from "expo-document-picker";

export default async function AudioPicker(onSend) {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "audio/*",
      multiple: true,
      copyToCacheDirectory: true,
    });

    if (!result.assets || result.assets.length === 0) return;

    const selected = result.assets.slice(0, 5);
    selected.forEach((file) =>
      onSend({
        type: "audio",
        uri: file.uri,
        name: file.name,
        size: file.size,
        mimeType: file.mimeType,
      })
    );
  } catch (err) {
    console.error("Audio Picker Error:", err);
  }
}




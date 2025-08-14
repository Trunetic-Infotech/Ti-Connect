// components/VideoPicker/VideoPicker.js
import * as ImagePicker from "expo-image-picker";

export default async function VideoPicker(onSend) {
  try {
    // Ask for media library permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access gallery is required!");
      return;
    }

    // Allow multiple selection, but filter to videos
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 1,
    });

    if (!result.canceled) {
      result.assets.forEach((video) => {
        onSend({
          type: "video",
          uri: video.uri,
          duration: video.duration, // optional
          fileName: video.fileName || `video_${Date.now()}.mp4`,
        });
      });
    }
  } catch (err) {
    console.error("Video picking error:", err);
  }
}

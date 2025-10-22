import { StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Video } from "expo-av";

const screenWidth = Dimensions.get("window").width;

const MediaItem = ({ item, onSelect }) => {
  if (item.message_type !== "video") return null;

  return (
    <TouchableOpacity onPress={() => onSelect({ type: "video", uri: item.media_url })}>
      <Video
        source={{ uri: item.media_url }}
        resizeMode="cover"
        useNativeControls
        style={styles.video}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  video: {
    width: screenWidth * 0.6,
    height: 200,
    borderRadius: 12,
    backgroundColor: "#000",
  },
});

export default MediaItem;

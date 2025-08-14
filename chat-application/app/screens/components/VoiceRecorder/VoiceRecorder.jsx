import { Audio } from "expo-av";
import { useState, useRef } from "react";

export default function useVoiceRecorder() {
  const [recording, setRecording] = useState(null);
  const recordingRef = useRef(null);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create new recording instance
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await newRecording.startAsync();

      recordingRef.current = newRecording;
      setRecording(newRecording);
    } catch (error) {
      console.log("Start recording error:", error);
    }
  };

  const stopRecording = async () => {
    try {
      const currentRecording = recordingRef.current;
      if (!currentRecording) return null;

      // Stop and unload
      await currentRecording.stopAndUnloadAsync();

      // Now get URI
      const uri = currentRecording.getURI();
      if (!uri) {
        console.log("Recording URI is null!");
        return null;
      }

      // Get duration
      const status = await currentRecording.getStatusAsync();
      const durationSeconds = (status.durationMillis / 1000).toFixed(1);

      // Reset
      recordingRef.current = null;
      setRecording(null);

      return {
        type: "voice",
        uri, // valid URI
        name: `voice-${Date.now()}.m4a`,
        mimeType: "audio/m4a",
        duration: durationSeconds,
      };
    } catch (error) {
      console.log("Stop recording error:", error);
      return null;
    }
  };

  return { recording, startRecording, stopRecording };
}

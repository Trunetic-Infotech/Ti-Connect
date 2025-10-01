import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector } from "react-redux";
import axios from "axios";
import { ScrollView } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";

const CreateGroup = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(""); // ✅ store uploaded image URL

  // pick image
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Denied", "Gallery access is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    console.log("ImageUrl", result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      createGroup(result.assets[0].uri); // ✅ upload instantly
    }
  };

  // create group
  const createGroup = async () => {
    setUploading(true);
    if (!name.trim()) {
      Alert.alert("Missing Info", "Please enter a group name!");
      return;
    }

    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        console.log("No token found → redirecting to login");
        router.replace("/screens/home");
        return;
      }

      const response = await axios.post(
        `${process.env.EXPO_API_URL}/groups/create`,
        {
          group_name: name,
          group_picture: imageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

    if (response.data?.success) {
  console.log("Group created:", response.data);

  const uploadedImageUrl = response.data.url;
  const id = response.data.groupId;
  const role = response.data.role;

  setImageUrl(uploadedImageUrl);

  Alert.alert("Success", "Group created successfully!", [
    {
      text: "OK",
      onPress: () =>
        router.replace({
          pathname: "/screens/pages/AddContact",
          params: {
            id: String(id),
            groupImage: String(uploadedImageUrl || ""),
            name: String(name),
            role: String(role),
          },
        }),
    },
  ]);
} else {
        Alert.alert("Failed", response.data?.message || "Please try again.");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Something went wrong. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <LinearGradient
            colors={["#6366f1", "#8b5cf6", "#ec4899"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="h-48 rounded-b-[40px] shadow-lg"
          >
            <View className="flex-row items-center justify-between px-5 pt-10">
              <TouchableOpacity
                onPress={() => router.back()}
                className="p-2 rounded-full bg-white/20"
              >
                <FontAwesome6 name="arrow-left-long" size={22} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-xl font-bold">Create Group</Text>
              <View />
            </View>
          </LinearGradient>

          {/* Group Picture */}
          <View className="items-center -mt-20">
            <View className="relative">
              <Image
                source={
                  image
                    ? { uri: image }
                    : require("../../../assets/images/dp.jpg")
                }
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  borderWidth: 5,
                  borderColor: "#fff",
                }}
              />
              {uploading && (
                <ActivityIndicator
                  size="large"
                  color="#8b5cf6"
                  style={{
                    position: "absolute",
                    top: "40%",
                    left: "40%",
                  }}
                />
              )}
              <TouchableOpacity
                onPress={pickImage}
                className="absolute bottom-2 right-2 bg-white p-3 rounded-full shadow"
              >
                <FontAwesome5 name="camera" size={20} color="#6366f1" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Form */}
          <View className="bg-white mx-5 mt-8 rounded-2xl p-6 shadow">
            <Text className="text-gray-600 font-semibold mb-2">Group Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              className="border border-gray-300 px-4 py-3 rounded-lg mb-4"
              placeholder="Enter group name"
            />

            <TouchableOpacity
              onPress={createGroup}
              className="rounded-2xl overflow-hidden"
            >
              <LinearGradient
                colors={["#6366f1", "#8b5cf6", "#ec4899"]}
                className="py-3 items-center rounded-2xl"
              >
                <Text className="text-white font-semibold text-lg">
                  Create Group
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateGroup;

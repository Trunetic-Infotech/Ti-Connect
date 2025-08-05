import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome6, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";

const ProfileEdit = () => {
  const router = useRouter();
  const [name, setName] = useState("Aman Verma");
  const [phone, setPhone] = useState("+91 557993469");
  const [image, setImage] = useState(require("../../../assets/images/dp.jpg"));
  const [modalVisible, setModalVisible] = useState(false);

  const pickImage = async () => {
    setModalVisible(false);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "We need access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage({ uri: result.assets[0].uri });
    }
  };

  const removeImage = () => {
    setModalVisible(false);
    setImage(require("../../../assets/images/userDp.png")); // fallback default
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <LinearGradient
        colors={["#6366f1", "#8b5cf6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="py-5 px-4 rounded-b-3xl shadow-md"
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome6 name="arrow-left-long" size={22} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-semibold ml-4">
            Edit Profile
          </Text>
        </View>
      </LinearGradient>

      {/* Body */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 px-6 pt-6"
      >
        <View className="items-center mb-6">
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <View className="relative">
              <Image
                source={image}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  borderWidth: 3,
                  borderColor: "#6366f1",
                }}
              />
              <View className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow">
                <FontAwesome name="camera" size={16} color="#6366f1" />
              </View>
            </View>
          </TouchableOpacity>

          <Text className="text-lg font-medium text-gray-800 mt-4">{name}</Text>
        </View>

        {/* Input Fields */}
        <View className="space-y-5">
          <View>
            <Text className="text-gray-600 mb-1 ml-1">Full Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              className="bg-gray-100 px-4 py-3 rounded-xl text-base text-gray-800"
              placeholder="Enter your name"
              placeholderTextColor="#999"
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-1 ml-1">Phone Number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              className="bg-gray-100 px-4 py-3 rounded-xl text-base text-gray-800"
              placeholder="Enter your phone number"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            onPress={() => console.log("Save pressed")}
            className="bg-indigo-500 py-3 rounded-xl shadow mt-4"
          >
            <Text className="text-white text-center text-base font-semibold">
              Save Changes
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Image Options Modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          onPress={() => setModalVisible(false)}
          className="flex-1 bg-black/40 justify-center items-center px-6"
          activeOpacity={1}
        >
          <View className="bg-white w-full rounded-2xl p-6">
            <Text className="text-lg font-semibold mb-4 text-center">
              Profile Photo
            </Text>
            <TouchableOpacity
              onPress={pickImage}
              className="py-3 px-4 rounded-xl bg-indigo-100 mb-3"
            >
              <Text className="text-indigo-600 text-center font-medium">
                Change Image
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={removeImage}
              className="py-3 px-4 rounded-xl bg-red-100"
            >
              <Text className="text-red-600 text-center font-medium">
                Remove Image
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileEdit;

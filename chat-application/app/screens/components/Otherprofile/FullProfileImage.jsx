import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import img from "../../../../assets/images/dp.jpg";

const FullProfileImage = () => {
  const router = useRouter();
  return (
    <View className="flex-1 bg-black justify-center items-center">
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-10 left-4 z-10"
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>
      <Image
        source={img}
        style={{ width: "100%", height: "100%", resizeMode: "contain" }}
      />
    </View>
  );
};

export default FullProfileImage;

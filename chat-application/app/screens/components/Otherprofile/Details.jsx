import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import img from "../../../../assets/images/dp.jpg";

const Details = () => {
  const router = useRouter();
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="relative">
        <Image source={img} className="w-full h-72" resizeMode="cover" />
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-10 left-4 bg-black/60 rounded-full p-2"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View className="px-4 py-6 space-y-4">
        <Text className="text-2xl font-bold text-gray-800">Aman Verma</Text>
        <Text className="text-gray-600">Last seen 10:59am</Text>

        <View className="mt-6">
          <Text className="text-sm text-gray-500 mb-2">About</Text>
          <Text className="text-gray-800">
            Hey there! I am using Ti-Connect.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default Details;

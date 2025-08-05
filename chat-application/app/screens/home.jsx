import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { Entypo } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

const Home = () => {
  const [phone, setPhone] = useState("");
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#dbeafe", "#e0f2fe", "#ffffff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <SafeAreaView className="flex-1 px-6 pt-14">
        <View className="space-y-4 mb-10">
          <Text className="text-center text-4xl font-extrabold text-indigo-700 drop-shadow-xl tracking-wider">
            Please Login!
          </Text>
          <Text className="text-center text-base text-gray-700">
            We'll send you a verification code.
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          className="flex-row items-center justify-between bg-white/90 px-5 py-4 rounded-2xl shadow-md border border-gray-100 mb-6 backdrop-blur-md"
        >
          <Text className="text-base text-gray-900 font-semibold">
            🇮🇳 India
          </Text>
          <Entypo name="chevron-down" size={24} color="#555" />
        </TouchableOpacity>

        <View className="bg-white/90 rounded-2xl px-5 py-4 shadow-md border border-gray-100 mb-10 backdrop-blur-md">
          <Text className="text-xs text-gray-500 mb-1">Phone Number</Text>
          <TextInput
            placeholder="(+91) 1234567891"
            keyboardType="phone-pad"
            className="text-lg text-gray-900 font-medium"
            placeholderTextColor="#999"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          disabled={phone.length < 10}
          onPress={() => {
            phone.length === 10
              ? router.push("./OtpScreen")
              : Alert.alert("Invalid Number");
          }}
          className="rounded-2xl shadow-xl disabled:opacity-50"
        >
          <LinearGradient
            colors={["#6366f1", "#3b82f6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-4 rounded-2xl"
          >
            <Text className="text-center text-white font-bold text-lg tracking-wide">
              Continue
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Home;

import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { Entypo } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const Home = () => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleContinue = () => {
    if (phone.length !== 10) {
      Alert.alert("Invalid Number", "Please enter a valid 10-digit number.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      router.push("./OtpScreen");
    }, 2000);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc] px-6 pt-14">
      <View className="space-y-3 mb-10">
        <Text className="text-center text-4xl font-extrabold text-[#1e3a8a] tracking-wide">
          Welcome 👋
        </Text>
        <Text className="text-center text-base text-gray-500">
          Enter your mobile number to login or register
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        className="flex-row items-center justify-between bg-white px-5 py-4 rounded-xl border border-gray-200 shadow-sm mb-6"
      >
        <Text className="text-base text-gray-800 font-medium">🇮🇳 India</Text>
        <Entypo name="chevron-down" size={22} color="#6b7280" />
      </TouchableOpacity>

      <View className="bg-white px-5 py-4 rounded-xl border border-gray-200 shadow-sm mb-10">
        <Text className="text-xs text-gray-500 mb-1">Phone Number</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="(+91) 9876543210"
          keyboardType="phone-pad"
          placeholderTextColor="#cbd5e1"
          className="text-lg text-gray-900 font-semibold"
        />
      </View>

      <TouchableOpacity
        onPress={handleContinue}
        activeOpacity={0.9}
        disabled={phone.length !== 10 || loading}
        className={`py-4 rounded-full ${
          phone.length === 10 && !loading
            ? "bg-[#1d4ed8]"
            : "bg-[#93c5fd] opacity-60"
        } shadow-md`}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-center text-white font-bold text-lg tracking-wide">
            Continue
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Home;
